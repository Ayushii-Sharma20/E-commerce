const amqp = require('amqplib')

let channel

async function connectQueue() {
  const connection = await amqp.connect('amqp://127.0.0.1')
  channel = await connection.createChannel()

  await channel.assertQueue('notifications')

  console.log("RabbitMQ Connected (Notification Service)")
}

function getChannel() {
  return channel
}

module.exports = { connectQueue, getChannel }