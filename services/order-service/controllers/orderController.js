const Order = require("../models/Order");
const axios = require("axios");

// ✅ Create Order
const createOrder = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    // 🔥 Call Product Service
    const productRes = await axios.get(
      `http://localhost:3002/api/products/${productId}`
    );

    const product = productRes.data;

    // ✅ Stock check
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    // 🧮 Calculate total
    const totalAmount = product.price * quantity;

    // 💾 Save Order
    const order = new Order({
      userId,
      productId,
      quantity,
      totalAmount
    });

    await order.save();

    res.status(201).json(order);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating order" });
  }
};


// ✅ Get All Orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};


// ✅ Get Orders by User
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user orders" });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getUserOrders
};