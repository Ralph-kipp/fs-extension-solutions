import { test, expect } from '@playwright/test'

const SERVER_URL = 'http://localhost:3001/anecdotes'

const createdContents = []

const getServerAnecdotes = async request => {
  const response = await request.get(SERVER_URL)
  return response.json()
}

const getServerContents = async request => {
  const anecdotes = await getServerAnecdotes(request)
  return anecdotes.map(anecdote => anecdote.content)
}

const deleteCreatedAnecdotes = async request => {
  for (const anecdote of await getServerAnecdotes(request)) {
    if (createdContents.includes(anecdote.content)) {
      await request.delete(`${SERVER_URL}/${anecdote.id}`)
    }
  }
  createdContents.length = 0
}

const createAnecdote = async (page, { content, author, info }) => {
  createdContents.push(content)
  await page.getByRole('link', { name: 'create new' }).click()
  const inputs = page.locator('form input')
  await inputs.nth(0).fill(content)
  await inputs.nth(1).fill(author)
  await inputs.nth(2).fill(info)
  await page.getByRole('button', { name: 'create' }).click()
}

test.describe('Anecdote app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.afterEach(async ({ request }) => {
    await deleteCreatedAnecdotes(request)
  })

  test('a new anecdote can be created', async ({ page }) => {
    const content = `an anecdote created by playwright ${Date.now()}`

    await createAnecdote(page, {
      content,
      author: 'Playwright',
      info: 'https://playwright.dev',
    })

    await expect(page).toHaveURL('/')
    await expect(page.getByText(content)).toBeVisible()
  })

  test('an anecdote can be deleted', async ({ page }) => {
    const content = `an anecdote to be deleted ${Date.now()}`

    await createAnecdote(page, {
      content,
      author: 'Playwright',
      info: 'https://playwright.dev',
    })

    const item = page.locator('li', { hasText: content })
    await expect(item).toBeVisible()

    await item.getByRole('button', { name: 'delete' }).click()

    await expect(page.getByText(content)).toHaveCount(0)
  })

  test('anecdotes are loaded from the server when the app opens', async ({ page, request }) => {
    const content = `an anecdote added straight to the server ${Date.now()}`
    createdContents.push(content)
    await request.post(SERVER_URL, {
      data: { content, author: 'Playwright', info: 'https://playwright.dev', votes: 0 },
    })

    await page.reload()

    await expect(page.getByText(content)).toBeVisible()
  })

  test('a created anecdote is saved to the server', async ({ page, request }) => {
    const content = `an anecdote saved to the server ${Date.now()}`

    await createAnecdote(page, {
      content,
      author: 'Playwright',
      info: 'https://playwright.dev',
    })

    await expect.poll(() => getServerContents(request)).toContain(content)
  })

  test('a deleted anecdote is removed from the server', async ({ page, request }) => {
    const content = `an anecdote removed from the server ${Date.now()}`

    await createAnecdote(page, {
      content,
      author: 'Playwright',
      info: 'https://playwright.dev',
    })
    await expect.poll(() => getServerContents(request)).toContain(content)

    await page
      .locator('li', { hasText: content })
      .getByRole('button', { name: 'delete' })
      .click()

    await expect.poll(() => getServerContents(request)).not.toContain(content)
  })
})

test.describe('Anecdote form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('the reset button clears all the fields', async ({ page }) => {
    await page.getByRole('link', { name: 'create new' }).click()
    const inputs = page.locator('form input')
    await inputs.nth(0).fill('some content')
    await inputs.nth(1).fill('some author')
    await inputs.nth(2).fill('https://example.com')

    const reset = page.getByRole('button', { name: /^reset$/i })
    await expect(reset, 'the form needs a reset button').toBeVisible()
    await reset.click()

    for (let i = 0; i < 3; i++) {
      await expect(inputs.nth(i)).toHaveValue('')
    }
  })

  test('the form does not cause React warnings about unknown props', async ({ page }) => {
    const messages = []
    page.on('console', message => {
      if (['error', 'warning'].includes(message.type())) messages.push(message.text())
    })

    await page.getByRole('link', { name: 'create new' }).click()
    const inputs = page.locator('form input')
    await inputs.nth(0).fill('some content')

    const reset = page.getByRole('button', { name: /^reset$/i })
    await expect(reset, 'the form needs a reset button').toBeVisible()
    await reset.click()
    await expect(inputs.nth(0)).toHaveValue('')

    const propWarnings = messages.filter(text =>
      /Invalid value for prop|does not recognize the .* prop/.test(text),
    )
    expect(propWarnings).toEqual([])
  })
})
