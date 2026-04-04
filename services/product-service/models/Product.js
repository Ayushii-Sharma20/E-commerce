const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  stock: Number,
  image: String,
  category: String
});

module.exports = mongoose.model("Product", productSchema);