import { useState, useEffect } from 'react'
import { Container, AppBar, Toolbar, Button, Typography } from '@mui/material'
import { Routes, Route, Link, Navigate, useNavigate, useMatch } from 'react-router-dom'
import BlogForm from './components/BlogForm'
import BlogView from './components/BlogView'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './components/Login'
import NotFound from './components/NotFound'
import Notification from './components/Notification'
import { useBlogStore } from './stores/blogStore'
import { useNotificationStore } from './stores/notificationStore'
import { useUserStore } from './stores/userStore'

const App = () => {
  const navigate = useNavigate()

  const blogs = useBlogStore((state) => state.blogs)
  const blogsLoaded = useBlogStore((state) => state.loaded)
  const initializeBlogs = useBlogStore((state) => state.initializeBlogs)
  const createBlog = useBlogStore((state) => state.createBlog)
  const likeBlog = useBlogStore((state) => state.likeBlog)
  const deleteBlog = useBlogStore((state) => state.deleteBlog)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const user = useUserStore((state) => state.user)
  const initializeUser = useUserStore((state) => state.initializeUser)
  const login = useUserStore((state) => state.login)
  const logout = useUserStore((state) => state.logout)
  const setNotification = useNotificationStore((state) => state.setNotification)

  // 5.25: find the blog for /blogs/:id (needs <BrowserRouter> in main.jsx)
  const match = useMatch('/blogs/:id')
  const blog = match ? blogs.find((b) => b.id === match.params.id) : null

  // blogs are public, so load them for everybody
  useEffect(() => {
    initializeBlogs().catch(() => {}) // on failure the store still sets loaded, and the list stays empty
  }, [initializeBlogs])

  useEffect(() => {
    initializeUser()
  }, [initializeUser])

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      await login({ username, password })
      setUsername('')
      setPassword('')
      navigate('/') // only reached if login succeeded
    } catch {
      setNotification('Wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleCreateBlog = async (blogObject) => {
    try {
      const newBlog = await createBlog(blogObject)
      setNotification(`a new blog ${newBlog.title} by ${newBlog.author} added`)
      navigate('/') // 5.26
    } catch {
      setNotification('creating the blog failed', 'error')
    }
  }

  const handleLike = async (blog) => {
    if (!user) return // 5.25: only logged-in users can like
    try {
      await likeBlog(blog)
    } catch {
      setNotification('updating the blog failed', 'error')
    }
  }

  const handleDelete = async (blog) => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      try {
        await deleteBlog(blog.id)
        setNotification(`Deleted blog ${blog.title} by ${blog.author}`)
        navigate('/') // 5.26
      } catch {
        setNotification('Deleting the blog failed', 'error')
      }
    }
  }

  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes) // copy, don't mutate state

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={Link} to="/">
            blogs
          </Button>
          {user && (
            <Button color="inherit" component={Link} to="/create">
              new blog
            </Button>
          )}
          {user ? (
            <>
              <span style={{ marginLeft: 'auto', marginRight: 10 }}>{user.name} logged in</span>
              <Button color="inherit" onClick={handleLogout}>
                logout
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login" sx={{ marginLeft: 'auto' }}>
              login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <h2>blog app</h2>
      <Notification /> {/* outside Routes: visible on every page */}
      {/* Only the routed content is inside the boundary: the nav bar, heading and
          notification above stay outside, so they keep working after an error */}
      <ErrorBoundary>
        <Routes>
          <Route
            path="/login"
            element={
              <Login
                username={username}
                password={password}
                handleUsernameChange={({ target }) => setUsername(target.value)}
                handlePasswordChange={({ target }) => setPassword(target.value)}
                handleSubmit={handleLogin}
              />
            }
          />
          <Route
            path="/create"
            element={user ? <BlogForm createBlog={handleCreateBlog} /> : <Navigate replace to="/login" />}
          />
          <Route
            path="/blogs/:id"
            element={
              // show nothing until the blogs have loaded, otherwise every id would flash "not found"
              !blogsLoaded ? null : blog ? (
                <BlogView blog={blog} user={user} handleLike={handleLike} handleDelete={handleDelete} />
              ) : (
                <NotFound />
              )
            }
          />
          <Route
            path="/"
            element={
              <div>
                <Typography variant="h4" component="h2">
                  blogs
                </Typography>
                {sortedBlogs.map((blog) => (
                  <div key={blog.id}>
                    <Link to={`/blogs/${blog.id}`}>
                      {blog.title} {blog.author}
                    </Link>
                  </div>
                ))}
              </div>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </Container>
  )
}

export default App
