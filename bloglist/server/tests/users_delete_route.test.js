const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const { connectDB, disconnectDB } = require('../controllers/mongo')
const { test, before, after, beforeEach } = require('node:test')

const api = supertest(app)

before(async () => {
  await connectDB()
})

beforeEach(async () => {
  await User.deleteMany({})
  await new User({ username: 'keepme', name: 'Keep Me', passwordHash: 'x' }).save()
})

test('DELETE /api/users no longer exists and removes nothing', async () => {
  await api.delete('/api/users').expect(404)

  const users = await User.find({})
  assert.strictEqual(users.length, 1)
})

after(async () => {
  await User.deleteMany({})
  await disconnectDB()
})
