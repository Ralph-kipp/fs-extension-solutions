const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const supertest = require('supertest')
const { test, before, after, describe, beforeEach } = require('node:test')
const app = require('../app')
const User = require('../models/user')
const Blog = require('../models/blog')
const { connectDB, disconnectDB } = require('../controllers/mongo')

const api = supertest(app)

let user
let user2
let token
let token2

const initialBlogs = [
  { title: 'First blog', author: 'Test Author', url: 'http://example.com/first', likes: 5 },
  { title: 'Second blog', author: 'Test Author', url: 'http://example.com/second', likes: 10 }
]

const login = async (username, password) => {
  const response = await api.post('/api/login').send({ username, password }).expect(200)

  return response.body.token
}

before(async () => {
  await connectDB()
})

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  user = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash: await bcrypt.hash('testpassword', 10)
  })
  await user.save()

  // A second user is needed for the ownership tests, so it is created up front
  // rather than retrofitted into the one test that needs it.
  user2 = new User({
    username: 'seconduser',
    name: 'Second User',
    passwordHash: await bcrypt.hash('testpassword2', 10)
  })
  await user2.save()

  const savedBlogs = await Blog.insertMany(initialBlogs.map((blog) => ({ ...blog, user: user._id })))
  user.blogs = savedBlogs.map((blog) => blog._id)
  await user.save()

  token = await login('testuser', 'testpassword')
  token2 = await login('seconduser', 'testpassword2')
})

describe('Reading blogs without a token', () => {
  // 4.22: registering userExtractor globally or on the whole blogs router
  // would break this. It is the regression test for that mistake.
  test('GET /api/blogs works without a token', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, initialBlogs.length)
  })

  test('GET /api/blogs populates the owner of each blog', async () => {
    const response = await api.get('/api/blogs').expect(200)

    const blog = response.body[0]
    assert.strictEqual(blog.user.username, 'testuser')
    assert.strictEqual(blog.user.passwordHash, undefined)
  })
})

describe('Creating blogs with a token', () => {
  test('a valid token creates a blog owned by the logged-in user', async () => {
    const blogsBefore = await Blog.find({})

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Blog',
        author: 'Test Author',
        url: 'http://example.com/new',
        likes: 3
      })
      .expect(201)

    const blogsAfter = await Blog.find({})
    assert.strictEqual(blogsAfter.length, blogsBefore.length + 1)
    assert.strictEqual(response.body.user.toString(), user._id.toString())
  })

  test('the new blog id is added to the users blogs array', async () => {
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Another Blog',
        author: 'Test Author',
        url: 'http://example.com/another',
        likes: 1
      })
      .expect(201)

    const updatedUser = await User.findById(user._id)
    const blogIds = updatedUser.blogs.map((id) => id.toString())

    assert.ok(blogIds.includes(response.body.id))
  })

  test('a lowercase bearer scheme is accepted', async () => {
    // tokenExtractor lowercases before testing the prefix but slices the
    // original string, so the token itself keeps its case.
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send({
        title: 'Lowercase Scheme',
        author: 'Test Author',
        url: 'http://example.com/lowercase',
        likes: 0
      })
      .expect(201)
  })

  test('no Authorization header returns 401 and creates nothing', async () => {
    const blogsBefore = await Blog.find({})

    const response = await api
      .post('/api/blogs')
      .send({
        title: 'Unauthorized Blog',
        author: 'Nobody',
        url: 'http://example.com/nope',
        likes: 0
      })
      .expect(401)

    // userExtractor answers this one itself, before jwt.verify ever runs.
    assert.strictEqual(response.body.error, 'token missing or invalid')

    const blogsAfter = await Blog.find({})
    assert.strictEqual(blogsAfter.length, blogsBefore.length)
  })

  test('a garbage token returns 401 and creates nothing', async () => {
    const blogsBefore = await Blog.find({})

    const response = await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer notarealtoken')
      .send({
        title: 'Garbage Token Blog',
        author: 'Nobody',
        url: 'http://example.com/nope',
        likes: 0
      })
      .expect(401)

    // This one reaches jwt.verify and comes back out through errorHandler,
    // so the message differs from the missing-header case above.
    assert.strictEqual(response.body.error, 'invalid token')

    const blogsAfter = await Blog.find({})
    assert.strictEqual(blogsAfter.length, blogsBefore.length)
  })

  test('an expired token returns 401 and creates nothing', async () => {
    // Signed here rather than waiting out the real one-hour expiry.
    const expiredToken = jwt.sign({ id: user._id, username: user.username }, process.env.SECRET, { expiresIn: -1 })

    const blogsBefore = await Blog.find({})

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${expiredToken}`)
      .send({
        title: 'Expired Token Blog',
        author: 'Nobody',
        url: 'http://example.com/nope',
        likes: 0
      })
      .expect(401)

    assert.strictEqual(response.body.error, 'token expired')

    const blogsAfter = await Blog.find({})
    assert.strictEqual(blogsAfter.length, blogsBefore.length)
  })
})

describe('Deleting blogs with a token', () => {
  test('the owner can delete their own blog', async () => {
    const blog = await Blog.findOne({ user: user._id })

    await api.delete(`/api/blogs/${blog._id}`).set('Authorization', `Bearer ${token}`).expect(204)

    const blogsAfter = await Blog.find({})
    assert.strictEqual(
      blogsAfter.some((b) => b._id.toString() === blog._id.toString()),
      false
    )
  })

  test('deleting a blog removes its id from the users blogs array', async () => {
    const blog = await Blog.findOne({ user: user._id })

    await api.delete(`/api/blogs/${blog._id}`).set('Authorization', `Bearer ${token}`).expect(204)

    const updatedUser = await User.findById(user._id)
    const blogIds = updatedUser.blogs.map((id) => id.toString())

    assert.strictEqual(blogIds.includes(blog._id.toString()), false)
  })

  test('another user cannot delete a blog they do not own', async () => {
    const blog = await Blog.findOne({ user: user._id })

    const response = await api.delete(`/api/blogs/${blog._id}`).set('Authorization', `Bearer ${token2}`).expect(403)

    // 403, not 401: the requester is authenticated, just not permitted.
    assert.strictEqual(response.body.error, 'user not authorized to delete this blog')
    assert.notStrictEqual(await Blog.findById(blog._id), null)
  })

  test('deleting a nonexistent blog returns 404', async () => {
    const nonexistentId = new mongoose.Types.ObjectId()

    const response = await api.delete(`/api/blogs/${nonexistentId}`).set('Authorization', `Bearer ${token}`).expect(404)

    assert.strictEqual(response.body.error, 'blog not found')
  })

  test('deleting with a malformatted id returns 400', async () => {
    // A well-formed-but-absent id and an unparseable one are different paths:
    // this one never reaches the 404 above, it throws CastError first.
    const response = await api.delete('/api/blogs/not-an-object-id').set('Authorization', `Bearer ${token}`).expect(400)

    assert.strictEqual(response.body.error, 'malformatted id')
  })

  test('deleting without a token returns 401 and deletes nothing', async () => {
    const blog = await Blog.findOne({ user: user._id })

    const response = await api.delete(`/api/blogs/${blog._id}`).expect(401)

    assert.strictEqual(response.body.error, 'token missing or invalid')
    assert.notStrictEqual(await Blog.findById(blog._id), null)
  })
})

after(async () => {
  await disconnectDB()
})
