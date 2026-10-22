const { test,before, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const {connectDB, disconnectDB} = require('../controllers/mongo')

const api = supertest(app)

after(async () => {
  await mongoose.connection.close()
})