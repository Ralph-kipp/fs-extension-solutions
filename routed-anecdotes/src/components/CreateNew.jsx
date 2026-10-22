import { useNavigate } from "react-router"
import { useAnecdotes, useField } from "../hooks"

const CreateNew = () => {
  const { addAnecdote } = useAnecdotes()
  const content = useField("text")
  const author = useField("text")
  const info = useField("text")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addAnecdote({
      content: content.value,
      author: author.value,
      info: info.value,
      votes: 0,
    })
    navigate("/")
  }

  return (
    <div>
      <h2>create a new anecdote</h2>
      <form onSubmit={handleSubmit}>
        <div>
          content
          <input name="content" {...content.inputProps} />
        </div>
        <div>
          author
          <input name="author" {...author.inputProps} />
        </div>
        <div>
          url for more info
          <input name="info" {...info.inputProps} />
        </div>
        <button>create</button>
        <button
          type="button"
          onClick={() => {
            content.reset()
            author.reset()
            info.reset()
          }}
        >
          reset
        </button>
      </form>
    </div>
  )
}

export default CreateNew
