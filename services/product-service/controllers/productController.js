const Product = require("../models/Product");
const redisClient = require("../config/redis");

// ✅ CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    // 🗑️ Clear cache
    await redisClient.del("products");
    console.log("🗑️ Cache cleared");

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET ALL PRODUCTS (WITH REDIS)
const getProducts = async (req, res) => {
  try {
    // 🔍 Check Redis
    const cachedProducts = await redisClient.get("products");

    if (cachedProducts) {
      console.log("🔥 From Redis");
      return res.json(JSON.parse(cachedProducts));
    }

    // 🗄️ Fetch from MongoDB
    const products = await Product.find();

    console.log("📦 From MongoDB");

    // 💾 Store in Redis (60 sec)
    await redisClient.set("products", JSON.stringify(products), {
      EX: 60,
    });

    res.json(products);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // 🗑️ Clear cache
    await redisClient.del("products");
    console.log("🗑️ Cache cleared");

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    // 🗑️ Clear cache
    await redisClient.del("products");
    console.log("🗑️ Cache cleared");

    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ SINGLE EXPORT (IMPORTANT)
module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};