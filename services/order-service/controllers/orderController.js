const Order = require("../models/Order");
const axios = require("axios");

// ✅ Create Order
const createOrder = async (req, res) => {
  const { userId, items, totalAmount, shippingInfo, paymentMethod } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // 🔥 STEP 1: VALIDATE + RESERVE
    for (let item of items) {
      const productRes = await axios.get(
        `http://localhost:3002/api/products/${item.productId}`
      );

      const product = productRes.data;

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`
        });
      }

      await axios.post("http://localhost:3004/api/inventory/reserve", {
        productId: item.productId,
        quantity: item.quantity
      });
    }

    // 💾 STEP 2: SAVE ORDER
    const order = new Order({
      userId,
      items,
      totalAmount,
      shippingInfo,
      paymentMethod,
      status: "PENDING"
    });

    await order.save();

    // ✅ STEP 3: CONFIRM STOCK
    for (let item of items) {
      await axios.post("http://localhost:3004/api/inventory/confirm", {
        productId: item.productId,
        quantity: item.quantity
      });
    }

    order.status = "CONFIRMED";
    await order.save();

    // ✅ FINAL RESPONSE (VERY IMPORTANT)
    res.status(201).json(order);

  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      message: "Error creating order",
      details: err.response?.data || err.message
    });
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