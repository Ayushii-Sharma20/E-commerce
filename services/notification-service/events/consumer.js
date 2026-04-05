const { getChannel } = require('../config/rabbitmq')
const Notification = require('../models/notification')

async function consumeMessages() {
  const channel = getChannel()

  if (!channel) {
    console.log("❌ Channel not ready")
    return
  }

  channel.consume('notifications', async (msg) => {
    if (!msg) return

    try {
      const data = JSON.parse(msg.content.toString())

      console.log("🔥 Received Event:", data)

      const saved = await Notification.create({
        userId: data.userId,
        message: data.message,
        type: data.type
      })

      console.log("✅ Notification saved:", saved._id)

      channel.ack(msg)
    } catch (error) {
      console.error("❌ Error processing message:", error)
    }
  })
}

module.exports = consumeMessages