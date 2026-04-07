const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    optimisticConcurrency: true
  }
);

// ⚠️ IMPORTANT: EXPORT DIRECTLY (NO OBJECT)
module.exports = mongoose.model("Inventory", inventorySchema);
