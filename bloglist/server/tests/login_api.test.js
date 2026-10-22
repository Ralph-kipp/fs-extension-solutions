const assert = require('node:assert')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const { connectDB, disconnectDB } = require('../controllers/mongo')
const { test, before, after, describe, beforeEach } = require('node:test')

const api = supertest(app)

const credentials = { username: 'testuser', password: 'testpassword' }

before(async () => {
  await connectDB()
})

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash(credentials.password, 10)
  const user = new User({
    username: credentials.username,
    name: 'Test User',
    passwordHash
  })

  await user.save()
})

describe('Login API', () => {
  test('correct credentials return a token', async () => {
    const response = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(typeof response.body.token, 'string')
    assert.ok(response.body.token.length > 0)
    assert.strictEqual(response.body.username, credentials.username)
    assert.strictEqual(response.body.name, 'Test User')
  })

  test('the returned token carries the users id', async () => {
    const response = await api.post('/api/login').send(credentials).expect(200)

    const decodedToken = jwt.verify(response.body.token, process.env.SECRET)
    const user = await User.findOne({ username: credentials.username })

    // userExtractor reads decodedToken.id, so the payload has to carry it.
    assert.strictEqual(decodedToken.id, user._id.toString())
  })

  test('login response does not contain passwordHash', async () => {
    const response = await api.post('/api/login').send(credentials).expect(200)

    assert.strictEqual(response.body.passwordHash, undefined)
    assert.strictEqual(response.body.password, undefined)
    assert.deepStrictEqual(Object.keys(response.body).sort(), ['name', 'token', 'username'])
  })

  test('wrong password returns 401', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: credentials.username, password: 'wrongpassword' })
      .expect(401)

    assert.strictEqual(response.body.error, 'Invalid username or password')
    assert.strictEqual(response.body.token, undefined)
  })

  test('nonexistent username returns 401 with the same message', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'doesnotexist', password: credentials.password })
      .expect(401)

    // Identical to the wrong-password message on purpose: the response must
    // not reveal whether the username exists.
    assert.strictEqual(response.body.error, 'Invalid username or password')
    assert.strictEqual(response.body.token, undefined)
  })
})

after(async () => {
  await disconnectDB()
})
