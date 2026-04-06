const Notification = require('../models/Notification')

// ✅ CREATE (supports sellerId + userId)
exports.createNotification = async (req, res) => {
  try {
    const userId = req.body.userId || req.body.sellerId
    const { message, type } = req.body

    if (!userId || !message) {
      return res.status(400).json({
        error: "userId/sellerId and message are required"
      })
    }

    const notification = await Notification.create({
      userId,
      message,
      type
    })

    console.log(`🔔 Notification for ${userId}: ${message}`)

    res.status(201).json(notification)

  } catch (err) {
    console.error("❌ Create Error:", err)
    res.status(500).json({ error: err.message })
  }
}

// ✅ GET USER NOTIFICATIONS
exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .lean()

    res.json(notifications)

  } catch (err) {
    console.error("❌ Fetch Error:", err)
    res.status(500).json({ error: err.message })
  }
}

// ✅ MARK AS READ
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params

    const updated = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ error: "Notification not found" })
    }

    res.json(updated)

  } catch (err) {
    console.error("❌ Mark Read Error:", err)
    res.status(500).json({ error: err.message })
  }
}