const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    stock: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: ""
    },
    colors: {
      type: [String],
      default: []
    },
    variants: {
      type: [
        {
          color: {
            type: String,
            required: true,
            trim: true
          },
          image: {
            type: String,
            required: true,
            trim: true
          }
        }
      ],
      default: []
    },
    category: {
      type: String,
      default: ""
    },
    sellerId: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED"],
      default: "PENDING"
    }
  },
  {
    timestamps: true,
    optimisticConcurrency: true
  }
);

module.exports = mongoose.model("Product", productSchema);
