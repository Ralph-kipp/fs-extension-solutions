import { BrowserRouter as Router, Routes, Route } from 'react-router'
import Menu from './components/Menu'
import AnecdoteList from './components/AnecdoteList'
import About from './components/About'
import Footer from './components/Footer'
import CreateNew from './components/CreateNew'
import anecdoteService from './services/anecdotes'

const App = () => {
  // Temporary until exercise 5 moves creating into the useAnecdotes hook:
  // save the anecdote to the server (AnecdoteList loads the list itself).
  const addAnecdote = async (anecdote) => {
    await anecdoteService.createNew(anecdote)
  }

  return (
    <Router>
      <div>
        <h1>Software anecdotes</h1>
        <Menu />
        <Routes>
          <Route path="/" element={<AnecdoteList />} />
          <Route path="/create" element={<CreateNew addAnecdote={addAnecdote} />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
