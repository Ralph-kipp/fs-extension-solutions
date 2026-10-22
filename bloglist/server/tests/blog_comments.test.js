const assert = require('node:assert')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const { test, before, after, describe, beforeEach } = require('node:test')
const app = require('../app')
const User = require('../models/user')
const Blog = require('../models/blog')
const { connectDB, disconnectDB } = require('../controllers/mongo')

const api = supertest(app)

let blog
let token

before(async () => {
  await connectDB()
})

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const user = new User({
    username: 'commenttester',
    name: 'Comment Tester',
    passwordHash: await bcrypt.hash('testpassword', 10)
  })
  await user.save()

  blog = await new Blog({ title: 'Commented blog', author: 'A', url: 'http://example.com/c', user: user._id }).save()
  user.blogs = [blog._id]
  await user.save()

  const login = await api.post('/api/login').send({ username: 'commenttester', password: 'testpassword' }).expect(200)
  token = login.body.token
})

describe('Comments API', () => {
  test('a comment is added without a token and the updated blog is returned with its user', async () => {
    const response = await api
      .post(`/api/blogs/${blog._id}/comments`)
      .send({ comment: '  nice read  ' })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(response.body.comments, ['nice read'])
    assert.strictEqual(response.body.user.username, 'commenttester')
  })

  test('GET /api/blogs returns the comments of each blog', async () => {
    await api.post(`/api/blogs/${blog._id}/comments`).send({ comment: 'first' }).expect(201)
    await api.post(`/api/blogs/${blog._id}/comments`).send({ comment: 'second' }).expect(201)

    const response = await api.get('/api/blogs').expect(200)
    assert.deepStrictEqual(response.body[0].comments, ['first', 'second'])
  })

  test('a blog without any comments has an empty comments array', async () => {
    const response = await api.get('/api/blogs').expect(200)
    assert.deepStrictEqual(response.body[0].comments, [])
  })

  test('an empty, blank, missing, non-string or too long comment gives 400', async () => {
    for (const body of [{ comment: '' }, { comment: '   ' }, {}, { comment: 42 }, { comment: 'x'.repeat(501) }]) {
      const response = await api.post(`/api/blogs/${blog._id}/comments`).send(body).expect(400)
      assert.ok(response.body.error)
    }
    const saved = await Blog.findById(blog._id)
    assert.strictEqual(saved.comments.length, 0)
  })

  test('an unknown but well-formed id gives 404 and a malformed id gives 400', async () => {
    await api.post('/api/blogs/000000000000000000000099/comments').send({ comment: 'hi' }).expect(404)
    await api.post('/api/blogs/not-an-id/comments').send({ comment: 'hi' }).expect(400)
  })

  test('liking a blog keeps its comments', async () => {
    await api.post(`/api/blogs/${blog._id}/comments`).send({ comment: 'keep me' }).expect(201)

    const response = await api
      .put(`/api/blogs/${blog._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ likes: 1 })
      .expect(200)

    assert.strictEqual(response.body.likes, 1)
    assert.deepStrictEqual(response.body.comments, ['keep me'])
  })
})

after(async () => {
  await disconnectDB()
})
