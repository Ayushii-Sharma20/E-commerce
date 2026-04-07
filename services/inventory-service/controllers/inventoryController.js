const Inventory = require("../models/Inventory");

const sendError = (res, statusCode, message, error = null) =>
  res.status(statusCode).json({
    success: false,
    message,
    error: error ? (typeof error === "string" ? error : error.message) : null
  });

const sendSuccess = (res, statusCode, message, data = {}) =>
  res.status(statusCode).json({
    success: true,
    message,
    ...data
  });

const normalizeQuantity = (quantity) => Number(quantity);

// ✅ GET STOCK
const getStock = async (req, res) => {
  try {
    const item = await Inventory.findOne({ productId: req.params.productId });

    if (!item) {
      return sendError(res, 404, "Product not found");
    }

    return sendSuccess(res, 200, "Inventory fetched successfully", { inventory: item });
  } catch (err) {
    return sendError(res, 500, "Failed to fetch inventory", err);
  }
};

// ✅ CREATE INVENTORY
const createInventory = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const normalizedQuantity = Math.max(normalizeQuantity(quantity) || 0, 0);

    if (!productId) {
      return sendError(res, 400, "productId is required");
    }

    const inventory = await Inventory.findOneAndUpdate(
      { productId },
      {
        $inc: { stock: normalizedQuantity },
        $setOnInsert: { reserved: 0 }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    return sendSuccess(res, 201, "Inventory created successfully", { inventory });

  } catch (err) {
    return sendError(res, 500, "Failed to create inventory", err);
  }
};

// ✅ UPDATE STOCK
const updateStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const normalizedQuantity = normalizeQuantity(quantity);

    if (!productId || Number.isNaN(normalizedQuantity)) {
      return sendError(res, 400, "productId and a valid quantity are required");
    }

    const item = await Inventory.findOneAndUpdate(
      { productId, ...(normalizedQuantity < 0 ? { stock: { $gte: Math.abs(normalizedQuantity) } } : {}) },
      {
        $inc: { stock: normalizedQuantity },
        $setOnInsert: { reserved: 0 }
      },
      {
        new: true,
        upsert: normalizedQuantity >= 0,
        setDefaultsOnInsert: true
      }
    );

    if (!item) {
      return sendError(res, 400, "Insufficient stock for this update");
    }

    return sendSuccess(res, 200, "Inventory updated successfully", { inventory: item });

  } catch (err) {
    return sendError(res, 500, "Failed to update inventory", err);
  }
};

// ✅ RESERVE STOCK
const reserveStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const normalizedQuantity = normalizeQuantity(quantity);

    if (!productId || !Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      return sendError(res, 400, "productId and a positive quantity are required");
    }

    const item = await Inventory.findOneAndUpdate(
      {
        productId,
        $expr: {
          $gte: [{ $subtract: ["$stock", "$reserved"] }, normalizedQuantity]
        }
      },
      {
        $inc: { reserved: normalizedQuantity }
      },
      { new: true }
    );

    if (!item) {
      return sendError(res, 400, "Out of stock");
    }

    return sendSuccess(res, 200, "Stock reserved", { inventory: item });

  } catch (err) {
    return sendError(res, 500, "Failed to reserve stock", err);
  }
};

// ✅ CONFIRM STOCK
const confirmStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const normalizedQuantity = normalizeQuantity(quantity);

    if (!productId || !Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      return sendError(res, 400, "productId and a positive quantity are required");
    }

    const item = await Inventory.findOneAndUpdate(
      {
        productId,
        reserved: { $gte: normalizedQuantity },
        stock: { $gte: normalizedQuantity }
      },
      {
        $inc: {
          stock: -normalizedQuantity,
          reserved: -normalizedQuantity
        }
      },
      { new: true }
    );

    if (!item) {
      return sendError(res, 400, "Not enough reserved stock");
    }

    return sendSuccess(res, 200, "Stock confirmed", { inventory: item });

  } catch (err) {
    return sendError(res, 500, "Failed to confirm stock", err);
  }
};

// ✅ RELEASE STOCK
const releaseStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const normalizedQuantity = normalizeQuantity(quantity);

    if (!productId || !Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      return sendError(res, 400, "productId and a positive quantity are required");
    }

    const item = await Inventory.findOneAndUpdate(
      {
        productId,
        reserved: { $gte: normalizedQuantity }
      },
      {
        $inc: { reserved: -normalizedQuantity }
      },
      { new: true }
    );

    if (!item) {
      return sendError(res, 400, "Invalid release quantity");
    }

    return sendSuccess(res, 200, "Stock released", { inventory: item });

  } catch (err) {
    return sendError(res, 500, "Failed to release stock", err);
  }
};

module.exports = {
  createInventory,
  getStock,
  updateStock,
  reserveStock,
  confirmStock,
  releaseStock
};
