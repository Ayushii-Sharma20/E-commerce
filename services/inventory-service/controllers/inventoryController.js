const Inventory = require("../models/Inventory");

// ❌ REMOVE DEBUG LOGS (not needed in production)

// ✅ GET STOCK
const getStock = async (req, res) => {
  try {
    const item = await Inventory.findOne({ productId: req.params.productId });

    if (!item) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE STOCK
const updateStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let item = await Inventory.findOne({ productId });

    if (!item) {
      item = new Inventory({ productId, stock: quantity });
    } else {
      item.stock += quantity;
    }

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ RESERVE STOCK
const reserveStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const item = await Inventory.findOne({ productId });

    if (!item) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (item.stock - item.reserved < quantity) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    item.reserved += quantity;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ CONFIRM STOCK (important fix)
const confirmStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const item = await Inventory.findOne({ productId });

    if (!item) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (item.reserved < quantity) {
      return res.status(400).json({ error: "Not enough reserved stock" });
    }

    item.stock -= quantity;
    item.reserved -= quantity;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ RELEASE STOCK (important fix)
const releaseStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const item = await Inventory.findOne({ productId });

    if (!item) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (item.reserved < quantity) {
      return res.status(400).json({ error: "Invalid release quantity" });
    }

    item.reserved -= quantity;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getStock,
  updateStock,
  reserveStock,
  confirmStock,
  releaseStock,
};