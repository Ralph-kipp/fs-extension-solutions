const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')
const {connectDB, disconnectDB} = require('./controllers/mongo')

logger.info('Connecting to MongoDB...')

connectDB()

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
