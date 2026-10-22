const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.post('/', async (request, response, next) => {
  try {
    const { username, name, password } = request.body

    // ensure password and name aree at least 3 characters long
    if (!password || password.length < 3) {
      return response.status(400).json({
        error: 'password must be at least 3 characters long'
      })
    } else if (!username || username.length < 3) {
      return response.status(400).json({
        error: 'username must be at least 3 characters long'
      })
    }

    //bycrypt is used to hash the password before saving it to the database
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    //newUser is made and saved to the database with the hashed password
    const user = new User({
      username,
      name,
      passwordHash
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    next(error)
  }})

  usersRouter.get('/', async (request, response, next) => {
    try {
      const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, id: 1 })
      response.json(users)
    } catch (error) {
      next(error)
    }
    })
  
  usersRouter.delete('/', async (request, response, next) => {
    try {
      await User.deleteMany({})
      response.status(204).end()
    } catch (error) {
      next(error)
    }
  })

module.exports = usersRouter