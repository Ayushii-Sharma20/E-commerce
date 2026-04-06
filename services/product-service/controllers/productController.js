const axios = require("axios"); // ✅ ADD THIS AT TOP

const createProduct = async (req, res) => {
  try {
    if (!req.body.sellerId) {
      return res.status(400).json({ error: "sellerId is required" });
    }

    // ✅ CREATE PRODUCT
    const product = await Product.create(req.body);
    await axios.post("http://localhost:3004/api/inventory", {
  productId: product._id,
  quantity: 10
});

    // 🔥 CREATE INVENTORY AUTOMATICALLY
    try {
      await axios.post("http://localhost:3004/api/inventory", {
        productId: product._id,
        quantity: 10
      });

      console.log("📦 Inventory created");
    } catch (err) {
      console.log("Inventory error:", err.message);
    }

    // 🗑️ CLEAR CACHE
    await redisClient.del("products");
    console.log("🗑️ Cache cleared");

    res.status(201).json(product);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};