const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },

  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      size: String,
      color: String,
      image: String
    }
  ],

  // ✅ FIXED STATUS (ONLY ONE)
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"],
    default: "PENDING"
  },

  totalAmount: {
    type: Number,
    required: true
  },

  shippingInfo: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },

  paymentMethod: {
    type: String,
    default: "card"
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);