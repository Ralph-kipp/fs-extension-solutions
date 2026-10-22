const mongoose = require('mongoose')
const config = require('../utils/config')

const connectDB = async () => {
  console.log('🚀 MONGO CONNECT START')

  try {
    await mongoose.connect(config.MONGODB_URI, { family: 4 })
    console.log('✅ MongoDB connected successfully')
  } catch (err) {
    console.log('❌ MongoDB connection failed:')
    console.log(err.message)
  }
}

const disconnectDB = async () => {
  try {
    await mongoose.connection.close()
  }catch (err) {
    console.log('❌ MongoDB disconnection failed:')
    console.log(err.message)
  }
}

module.exports = { connectDB, disconnectDB }