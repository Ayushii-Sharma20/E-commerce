const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: "general"
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

// ✅ optional: index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)