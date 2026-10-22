import { useState, useEffect } from 'react'
import { Container, AppBar, Toolbar, Button } from '@mui/material'
import { Routes, Route, Link, Navigate, useNavigate, useMatch } from 'react-router-dom'
import BlogForm from './components/BlogForm'
import BlogView from './components/BlogView'
import Login from './components/Login'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const navigate = useNavigate()

  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  // 5.25: find the blog for /blogs/:id (needs <BrowserRouter> in main.jsx)
  const match = useMatch('/blogs/:id')
  const blog = match ? blogs.find(b => b.id === match.params.id) : null

  // blogs are public, so load them for everybody
  useEffect(() => {
    blogService.getAll().then(blogs => setBlogs(blogs))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteAppUser')
    if (loggedUserJSON) {
      const loggedUser = JSON.parse(loggedUserJSON)
      setUser(loggedUser)
      blogService.setToken(loggedUser.token)
    }
  }, [])

  const notify = (text, type = 'success') => {
    setErrorMessage({ text, type })
    setTimeout(() => setErrorMessage(null), 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const loggedUser = await loginService.login({ username, password })
      window.localStorage.setItem('loggedNoteAppUser', JSON.stringify(loggedUser))
      blogService.setToken(loggedUser.token)
      setUser(loggedUser)
      setUsername('')
      setPassword('')
      navigate('/')                       // only reached if login succeeded
    } catch {
      notify('Wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedNoteAppUser')
    blogService.setToken(null)
    setUser(null)
    navigate('/')
  }

  const handleCreateBlog = async (blogObject) => {
    try {
      const newBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat({ ...newBlog, user: { id: newBlog.user, username: user.username, name: user.name } }))
      notify(`a new blog ${newBlog.title} by ${newBlog.author} added`)
      navigate('/')                       // 5.26
    } catch {
      notify('creating the blog failed', 'error')
    }
  }

  const handleLike = async (blog) => {
    if (!user) return                     // 5.25: only logged-in users can like
    const updatedBlog = {
      user: blog.user ? blog.user.id : undefined,
      likes: blog.likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url
    }
    try {
      const returnedBlog = await blogService.update(blog.id, updatedBlog)
      setBlogs(blogs.map(b => b.id === blog.id ? { ...returnedBlog, user: blog.user } : b))
    } catch {
      notify('updating the blog failed', 'error')
    }
  }

  const handleDelete = async (blog) => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      try {
        await blogService.remove(blog.id)
        setBlogs(blogs.filter(b => b.id !== blog.id))
        notify(`Deleted blog ${blog.title} by ${blog.author}`)
        navigate('/')                     // 5.26
      } catch {
        notify('Deleting the blog failed', 'error')
      }
    }
  }

  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)   // copy, don't mutate state

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={Link} to="/">blogs</Button>
          {user && <Button color="inherit" component={Link} to="/create">new blog</Button>}
          {user
            ? <>
              <span style={{ marginLeft: 'auto', marginRight: 10 }}>{user.name} logged in</span>
              <Button color="inherit" onClick={handleLogout}>logout</Button>
            </>
            : <Button color="inherit" component={Link} to="/login" sx={{ marginLeft: 'auto' }}>login</Button>}
        </Toolbar>
      </AppBar>

      <h2>blog app</h2>
      <Notification message={errorMessage} />   {/* outside Routes: visible on every page */}

      <Routes>
        <Route path="/login" element={
          <Login
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleSubmit={handleLogin}
          />
        } />
        <Route path="/create" element={
          user ? <BlogForm createBlog={handleCreateBlog} /> : <Navigate replace to="/login" />
        } />
        <Route path="/blogs/:id" element={
          <BlogView blog={blog} user={user} handleLike={handleLike} handleDelete={handleDelete} />
        } />
        <Route path="/" element={
          <div>
            {sortedBlogs.map(blog =>
              <div key={blog.id}>
                <Link to={`/blogs/${blog.id}`}>{blog.title} {blog.author}</Link>
              </div>
            )}
          </div>
        } />
      </Routes>
    </Container>
  )
}

export default App