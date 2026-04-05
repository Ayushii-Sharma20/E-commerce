const amqp = require('amqplib')

let channel

async function connectQueue() {
  const connection = await amqp.connect('amqp://localhost')
  channel = await connection.createChannel()

  await channel.assertQueue('notifications')

  console.log("🐰 RabbitMQ Connected (Order Service)")
}

function sendToQueue(data) {
  if (!channel) {
    console.log("❌ Channel not ready")
    return
  }

  channel.sendToQueue(
    'notifications',
    Buffer.from(JSON.stringify(data))
  )

  console.log("📤 Event Sent:", data)
}

module.exports = { connectQueue, sendToQueue }