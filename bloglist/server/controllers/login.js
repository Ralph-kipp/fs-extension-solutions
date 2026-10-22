const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')

loginRouter.post('/', async (request, response, next) => {
  const { username, password } = request.body

  try {
    const user = await User.findOne({ username })

    if (!user) {
      return response.status(401).json({ error: 'Invalid username or password' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)

    if (!isMatch) {
      return response.status(401).json({ error: 'Invalid username or password' })
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.SECRET,
      { expiresIn: '1h' }
    )

    response.status(200).send({ token, username: user.username, name: user.name })
  } catch (error) {
    next(error)
  }
})

module.exports = loginRouter