import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { test, expect } from "@playwright/test"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, "..", "..", "routed-anecdotes", "src")

// removes // and /* */ comments so that commented-out code cannot satisfy a check.
// String, template and regex literals are copied as they are, so "http://..."
// and /\/*$/ survive. A quote ends at the line break, so an apostrophe in JSX
// text ("don't") cannot swallow the code after it.
const stripComments = (source) => {
  let result = ""
  let i = 0

  // after one of these a "/" starts a regex literal; after anything else
  // (an identifier, ")", "<" of a JSX closing tag) it is a division or JSX
  const regexMayStart = () => {
    const previous = result.trimEnd().slice(-1)
    return previous === "" || "(,=:[!&|?{;".includes(previous)
  }

  while (i < source.length) {
    const char = source[i]
    const next = source[i + 1]

    if (char === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") i++
    } else if (char === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2)
      i = end === -1 ? source.length : end + 2
    } else if (char === "/" && regexMayStart()) {
      result += char
      i++
      let inClass = false
      while (i < source.length && source[i] !== "\n") {
        const c = source[i]
        result += c
        i++
        if (c === "\\") result += source[i++] ?? ""
        else if (c === "[") inClass = true
        else if (c === "]") inClass = false
        else if (c === "/" && !inClass) break
      }
    } else if (char === '"' || char === "'" || char === "`") {
      result += char
      i++
      while (i < source.length && source[i] !== char) {
        if (char !== "`" && source[i] === "\n") break
        if (source[i] === "\\") result += source[i++]
        result += source[i++] ?? ""
      }
      if (source[i] === char) result += source[i++]
    } else {
      result += char
      i++
    }
  }
  return result
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    if (/\.jsx?$/.test(entry.name)) return [full]
    return []
  })

const allFiles = walk(srcDir).map((file) => ({
  file: path.relative(srcDir, file).split(path.sep).join("/"),
  source: stripComments(fs.readFileSync(file, "utf-8")),
}))

const sourceOf = (file) => allFiles.find((f) => f.file === file)?.source ?? ""
const hookFiles = allFiles.filter(({ file }) => file.startsWith("hooks/"))
// everything that is not a hook or the service: components, App, main
const componentFiles = allFiles.filter(
  ({ file }) => !file.startsWith("hooks/") && !file.startsWith("services/"),
)

// the file that defines a hook, wherever it lives
const definerOf = (name) =>
  allFiles.find(({ source }) =>
    new RegExp(`(?:const|let|function)\\s+${name}\\s*[=(]`).test(source),
  )

// a call of the hook, not a definition and not a method that happens to share the name
const callsOf = (source, name) =>
  (source.match(new RegExp(`(?<![\\w$.])${name}\\s*\\(`, "g")) ?? []).length -
  (source.match(new RegExp(`function\\s+${name}\\s*\\(`, "g")) ?? []).length

// `export const name`, `export function name` or `export { name }` (also as a re-export)
const exportsName = (source, name) =>
  new RegExp(`export\\s+(?:async\\s+)?(?:const|let|function)\\s+${name}\\b`).test(source) ||
  new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`).test(source)

const exportsDefault = (source, name) =>
  new RegExp(`export\\s+default\\s+(?:function\\s+)?${name}\\b`).test(source)

test.describe("hooks are structured as the material describes", () => {
  test("src/hooks/index.js exists", () => {
    expect(fs.existsSync(path.join(srcDir, "hooks", "index.js"))).toBe(true)
  })

  test("useField is exported from src/hooks", () => {
    // exercise 1 allows the named export and, as the alternative it mentions, the default export
    expect(
      hookFiles.some(
        ({ source }) => exportsName(source, "useField") || exportsDefault(source, "useField"),
      ),
    ).toBe(true)
  })

  test("useAnecdotes is exported from src/hooks", () => {
    expect(hookFiles.some(({ source }) => exportsName(source, "useAnecdotes"))).toBe(true)
  })

  test("useAnecdotes is defined in exactly one module", () => {
    const definers = allFiles.filter(({ source }) =>
      /(?:const|function)\s+useAnecdotes\s*[=(]/.test(source),
    )
    expect(definers.length).toBe(1)
  })

  test("useField exposes a reset function", () => {
    const definer = definerOf("useField")
    expect(definer, "useField should be defined somewhere in src").toBeTruthy()
    expect(definer.source, `${definer.file} should expose reset`).toMatch(/\breset\b/)
  })

  test("useAnecdotes exposes addAnecdote and deleteAnecdote", () => {
    const definer = definerOf("useAnecdotes")
    expect(definer, "useAnecdotes should be defined somewhere in src").toBeTruthy()
    expect(definer.source, `${definer.file} should expose addAnecdote`).toMatch(/\baddAnecdote\b/)
    expect(definer.source, `${definer.file} should expose deleteAnecdote`).toMatch(/\bdeleteAnecdote\b/)
  })

  test("useField is used for the form fields", () => {
    const calls = allFiles.reduce((sum, { source }) => sum + callsOf(source, "useField"), 0)
    expect(calls, "useField should be called to create the form fields").toBeGreaterThan(0)
  })

  test("the field props are passed with the spread syntax", () => {
    // a JSX attribute spread such as <input {...content} /> or <Field {...content.inputProps} />
    const spreadsProps = componentFiles.some(({ source }) =>
      /<[A-Za-z][\w.]*\b[^<]*?\s\{\s*\.\.\.[^}]+\}/.test(source),
    )
    expect(spreadsProps, "the form should spread the field props into the inputs").toBe(true)
  })

  test("App passes no props to the routed components", () => {
    const source = sourceOf("App.jsx")
    expect(source, "App should render <AnecdoteList />").toMatch(/<AnecdoteList\s*\/>/)
    expect(source, "App should render <CreateNew />").toMatch(/<CreateNew\s*\/>/)
  })

  test("AnecdoteList calls useAnecdotes directly", () => {
    const calls = callsOf(sourceOf("components/AnecdoteList.jsx"), "useAnecdotes")
    expect(calls, "components/AnecdoteList.jsx should call useAnecdotes()").toBeGreaterThan(0)
  })

  test("CreateNew calls useAnecdotes directly", () => {
    const calls = callsOf(sourceOf("components/CreateNew.jsx"), "useAnecdotes")
    expect(calls, "components/CreateNew.jsx should call useAnecdotes()").toBeGreaterThan(0)
  })

  test("only the hooks import the anecdotes service", () => {
    for (const { file, source } of componentFiles) {
      expect(
        source,
        `${file} should not import the anecdotes service directly`,
      ).not.toMatch(/(?:from\s*|import\s*\(\s*)['"][^'"]*services\/anecdotes(?:\.js)?['"]/)
    }
  })

  test("only the hooks and the service call fetch", () => {
    for (const { file, source } of componentFiles) {
      expect(source, `${file} should not call fetch directly`).not.toMatch(
        /(?<![\w$])fetch\s*\(/,
      )
    }
  })
})
