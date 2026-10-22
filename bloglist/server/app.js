const path = require('path')
const express = require('express')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()

app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

// In production the server also serves the built frontend (client/dist)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'client', 'dist')

  app.use(express.static(distPath))

  // Any other non-API path gets index.html so client-side routes work on reload
  app.get('/*splat', (request, response, next) => {
    if (request.path.startsWith('/api')) {
      return next()
    }
    response.sendFile(path.join(distPath, 'index.html'))
  })
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
