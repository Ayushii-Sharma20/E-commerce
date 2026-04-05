const Notification = require('../models/notification')

// ✅ CREATE
exports.createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body

    if (!userId || !message) {
      return res.status(400).json({ error: "userId and message are required" })
    }

    const notification = await Notification.create({
      userId,
      message,
      type
    })

    res.status(201).json(notification)
  } catch (err) {
    console.error("❌ Create Error:", err)
    res.status(500).json({ error: err.message })
  }
}

// ✅ GET
exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({ error: "userId is required" })
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 }) // latest first
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