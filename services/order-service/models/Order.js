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
  },

  status: {
    type: String,
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);