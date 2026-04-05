const express = require('express')
const cors = require('cors')

require('dotenv').config({ path: __dirname + '/.env' })

const app = express()

const connectDB = require('./config/db')
const { connectQueue } = require('./config/rabbitmq')
const consumeMessages = require('./events/consumer')
const notificationRoutes = require('./routes/notificationRoutes')

app.use(cors()) // 🔥 THIS FIXES YOUR ERROR
app.use(express.json())

app.use('/api/notifications', notificationRoutes)

async function startServer() {
  await connectDB()
  await connectQueue()
  await consumeMessages()

  console.log("👂 Listening to queue...")

  app.listen(process.env.PORT, () => {
    console.log(`🚀 Notification Service running on port ${process.env.PORT}`)
  })
}

startServer()