const Order = require("../models/Order");
const axios = require("axios");

// 🔗 Service URLs
const PRODUCT_SERVICE = "http://localhost:3002/api/products";
const INVENTORY_SERVICE = "http://localhost:3004/api/inventory";

// ✅ Create Order
const createOrder = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const productRes = await axios.get(
      `${PRODUCT_SERVICE}/${productId}`
    );

    const product = productRes.data;

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await axios.post(`${INVENTORY_SERVICE}/reserve`, {
      productId,
      quantity
    });

    const totalAmount = product.price * quantity;

    const order = new Order({
      userId,
      productId,
      quantity,
      totalAmount,
      status: "PENDING"
    });

    await order.save();

    const paymentSuccess = true;

    if (paymentSuccess) {
      await axios.post(`${INVENTORY_SERVICE}/confirm`, {
        productId,
        quantity
      });

      order.status = "CONFIRMED";
    } else {
      await axios.post(`${INVENTORY_SERVICE}/release`, {
        productId,
        quantity
      });

      order.status = "FAILED";
    }

    await order.save();

    res.status(201).json(order);

  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      message: "Error creating order",
      details: err.response?.data || err.message
    });
  }
};

// ✅ Get all orders
const getOrders = async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
};

// ✅ Get orders by user
const getUserOrders = async (req, res) => {
  const { userId } = req.params;

  const orders = await Order.find({ userId });
  res.json(orders);
};

// ✅ EXPORT (MOST IMPORTANT)
module.exports = {
  createOrder,
  getOrders,
  getUserOrders
};