const mongoose = require('mongoose')   // ✅ ONLY ONCE

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

notificationSchema.index({ userId: 1, createdAt: -1 })

// ✅ SAFE EXPORT
module.exports =
  mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema)