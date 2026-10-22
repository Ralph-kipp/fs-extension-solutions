const supertest = require('supertest')
const app = require('../app')
const { connectDB, disconnectDB } = require('../controllers/mongo')
const { test, before, after, describe, beforeEach } = require('node:test')
const User = require('../models/user')
const assert = require('assert')

const api = supertest(app)

before(async () => {
  await connectDB()
})

describe('Initial operations test for Users API', () => {
  // Must be read inside each test, after the wipe. Reading it at suite level
  // captures whatever was in the database when the file was loaded.
  const usersInDb = async () => {
    const response = await api.get('/api/users').expect(200)
    return response.body
  }

  beforeEach(async () => {
    await User.deleteMany({})
  })

  test('POST /api/users creates a new user', async () => {
    const usersBefore = await usersInDb()

    await api
      .post('/api/users')
      .send({ username: 'testuser', name: 'Test User', password: 'testpassword' })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await usersInDb()
    assert.strictEqual(usersAfter.length, usersBefore.length + 1)
  })

  test('POST /api/users does not return the password hash', async () => {
    const response = await api
      .post('/api/users')
      .send({ username: 'testuser', name: 'Test User', password: 'testpassword' })
      .expect(201)

    assert.strictEqual(response.body.passwordHash, undefined)
  })

  test('GET /api/users returns all users', async () => {
    const usersBefore = await usersInDb()

    await api
      .post('/api/users')
      .send({ username: 'testuser', name: 'Test User', password: 'testpassword' })
      .expect(201)

    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, usersBefore.length + 1)
  })

  test('POST /api/users with short password returns 400', async () => {
    const response = await api
      .post('/api/users')
      .send({ username: 'testuser', name: 'Test User', password: 'pw' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.error, 'password must be at least 3 characters long')
  })

  test('POST /api/users with short username returns 400', async () => {
    const response = await api
      .post('/api/users')
      .send({ username: 'us', name: 'Test User', password: 'testpassword' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.error, 'username must be at least 3 characters long')
  })

  test('POST /api/users with a duplicate username returns 400', async () => {
    const newUser = { username: 'testuser', name: 'Test User', password: 'testpassword' }

    await api.post('/api/users').send(newUser).expect(201)

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.strictEqual(response.body.error, 'username must be unique')
  })
})

after(async () => {
  await disconnectDB()
})
