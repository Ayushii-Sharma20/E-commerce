const Notification = require('../models/notification')

exports.createNotification = async (data) => {
  return await Notification.create(data)
}

exports.getNotifications = async (userId) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 })
}