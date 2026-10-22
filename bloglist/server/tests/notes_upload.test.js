const supertest = require('supertest')
const app = require('../app')
const { connectDB, disconnectDB } = require('../controllers/mongo')
const { test, before, after, describe, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const assert = require('assert')

const api = supertest(app)

before(async () => {
  await connectDB()
})

describe('Notes API', () => {
  const initialBlogs = [
    { title: 'Test Blog 1', author: 'Test Author 1', url: 'https://www.testblog1.com', likes: 5 },
    { title: 'Test Blog 2', author: 'Test Author 2', url: 'https://www.testblog2.com', likes: 10 },
    { title: 'Test Blog 3', author: 'Test Author 3', url: 'https://www.testblog3.com', likes: 15 }
  ]

  const newBlog = {
    title: 'Test Blog',
    author: 'Test Author',
    url: 'https://www.testblog.com'
  }

  let user
  let token

  // Since 4.19/4.21 the write routes require a token, so every run needs a
  // logged-in owner and blogs that actually belong to them.
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('testpassword', 10)
    user = new User({ username: 'testuser', name: 'Test User', passwordHash })
    await user.save()

    const savedBlogs = await Blog.insertMany(initialBlogs.map((blog) => ({ ...blog, user: user._id })))
    user.blogs = savedBlogs.map((blog) => blog._id)
    await user.save()

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'testuser', password: 'testpassword' })
      .expect(200)

    token = loginResponse.body.token
  })

  test('GET /api/blogs returns all blogs', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, initialBlogs.length)
  })

  test('GET /api/blogs converts internal _id to id', async () => {
    const response = await api.get('/api/blogs').expect(200)

    const blog = response.body[0]
    assert.notStrictEqual(blog.id, undefined, 'expected blog to have an id property')
    assert.strictEqual(blog._id, undefined)
  })

  test('POST /api/blogs assumes likes is 0 if missing', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs').expect(200)
    assert.strictEqual(response.body.length, initialBlogs.length + 1)

    const created = response.body.find((b) => b.title === newBlog.title)
    assert.strictEqual(created.likes, 0)
  })

  test('POST /api/blogs without title returns 400 Bad Request', async () => {
    const invalidBlog = {
      author: 'Invalid Author',
      likes: 5,
      url: 'https://www.invalidblog.com'
    }

    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(invalidBlog).expect(400)
  })

  test('DELETE /api/blogs/:id deletes a blog', async () => {
    const blogs = await api.get('/api/blogs').expect(200)
    const blogToDelete = blogs.body[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).set('Authorization', `Bearer ${token}`).expect(204)

    const after = await api.get('/api/blogs').expect(200)
    assert.strictEqual(after.body.length, initialBlogs.length - 1)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('a created blog is returned as json', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })
})

describe('Tests after correcting and completing part 4 C & D', () => {
  test('updating blog likes', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToUpdate = blogsAtStart.body[0]

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ ...blogToUpdate, likes: blogToUpdate.likes + 1 })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)
  })
})

after(async () => {
  await disconnectDB()
})
