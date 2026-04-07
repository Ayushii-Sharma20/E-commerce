const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer"
    },
    blocked: {
      type: Boolean,
      default: false
    },
    sellerStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
