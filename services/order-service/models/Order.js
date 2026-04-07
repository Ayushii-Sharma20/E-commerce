const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true
    },
    buyerId: {
      type: String
    },
    sellerId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    size: {
      type: String,
      default: ""
    },
    color: {
      type: String,
      default: ""
    },
    image: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: String,
      required: true,
      index: true
    },
    sellerIds: {
      type: [String],
      required: true,
      default: []
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Order must include at least one item"
      }
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
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
  },
  {
    timestamps: true,
    optimisticConcurrency: true
  }
);

orderSchema.pre("validate", function syncBuyerId() {
  if (Array.isArray(this.items)) {
    this.items = this.items.map((item) => ({
      ...(typeof item.toObject === "function" ? item.toObject() : item),
      buyerId: this.buyerId
    }));
  }
});

module.exports = mongoose.model("Order", orderSchema);
