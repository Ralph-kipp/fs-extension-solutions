// controllers/blogs.js
// Event handlers for /api/blogs routes.
// Uses express.Router() — a "mini app" for just these routes.

const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')

// GET /api/blogs → return all blogs

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({})
      .populate('user', { username: 1, name: 1, id: 1 })

    response.json(blogs)
  } catch (error) {
    next(error)
  }
})

// POST /api/blogs → create a new blog

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  try {
    const user = request.user

    // Is there actually a logged-in user?
    if (!user) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    // Create blog belonging to this user
    const blog = new Blog({
      title: request.body.title,
      author: request.body.author,
      url: request.body.url,
      likes: request.body.likes || 0,
      user: user._id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})
// PUT /api/blogs/:id → update likes

blogsRouter.put('/:id', async (request, response, next) => {
  const { likes } = request.body

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      { likes },
      { returnDocument: 'after', runValidators: true }
    ).populate('user', { username: 1, name: 1, id: 1 })

    if (!updatedBlog) {
      return response.status(404).json({ error: 'blog not found' })
    }

    response.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

// DELETE /api/blogs/:id → delete a blog by ID

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  try {
    const user = request.user
    // Is there actually a logged-in user?
    if (!user) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const blog = await Blog.findById(request.params.id)

    if (!blog) {
      return response.status(404).json({ error: 'blog not found' })
    }
    if (blog.user.toString() !== request.user._id.toString()) {
      return response.status(403).json({ error: 'user not authorized to delete this blog' })
    }

    user.blogs = user.blogs.filter(b => b.toString() !== blog._id.toString())
    await user.save()

    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter