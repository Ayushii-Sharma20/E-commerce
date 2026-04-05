const express = require("express")
const cors = require("cors")
require("dotenv").config()

const { connectQueue } = require('./utils/rabbitmq')
const connectDB = require("./db")
const orderRoutes = require("./routes/OrderRoutes")

const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.use("/api/orders", orderRoutes)

// Test route
app.get("/", (req, res) => {
  res.send("Order Service Running 🚀")
})

// ✅ Proper startup
async function startServer() {
  try {
    await connectDB()
    await connectQueue()

    app.listen(process.env.PORT, () => {
      console.log(`🚀 Order Service running on port ${process.env.PORT}`)
    })
  } catch (error) {
    console.error("❌ Server startup error:", error)
  }
}

startServer()