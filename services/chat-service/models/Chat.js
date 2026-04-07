const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true
    },
    senderRole: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    readBy: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    participants: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 2,
        message: "A conversation must contain exactly two participants"
      }
    },
    participantRoles: {
      type: Map,
      of: String,
      default: {}
    },
    messages: {
      type: [messageSchema],
      default: []
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 }, { unique: true });

module.exports = mongoose.model("Chat", chatSchema);
