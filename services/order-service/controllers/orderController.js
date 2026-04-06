const Order = require("../models/Order");
const axios = require("axios");
const { sendToQueue } = require("../utils/rabbitmq");

// ✅ CREATE ORDER
const createOrder = async (req, res) => {
  const { userId, items, totalAmount, shippingInfo, paymentMethod } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    let enrichedItems = [];
    let sellerIds = [];

    // 🔥 STEP 1: VALIDATE + RESERVE + ENRICH
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

      // 🔒 Reserve stock
      try {
        await axios.post("http://localhost:3004/api/inventory/reserve", {
          productId: item.productId,
          quantity: item.quantity
        });
      } catch (err) {
        return res.status(400).json({
          message: `${product.name} is out of stock`
        });
      }

      // ✅ Collect sellerId
      sellerIds.push(product.sellerId);

      // ✅ Enriched item
      enrichedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: product.image?.startsWith("http")
          ? product.image
          : `http://localhost:3002${product.image}`
      });
    }

    // 💾 STEP 2: SAVE ORDER
    const order = new Order({
      userId,
      items: enrichedItems,
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

    // 🔄 Update status
    order.status = "CONFIRMED";
    await order.save();

    // 🔔 SEND EVENT (RabbitMQ)
    sendToQueue({
      userId: order.userId,
      message: `Order ${order._id} placed successfully`,
      type: "order"
    });

    // 🔔 NOTIFY SELLERS (NEW FEATURE)
    try {
      for (let sellerId of sellerIds) {
        await axios.post("http://localhost:3005/api/notify", {
          sellerId,
          message: `New order ${order._id} received`
        });
      }
      console.log("📢 Sellers notified");
    } catch (err) {
      console.log("⚠️ Notification failed (non-blocking)");
    }

    res.status(201).json(order);

  } catch (err) {
    console.error("❌ ORDER ERROR:", err.message);

    if (err.response && err.response.data) {
      return res.status(err.response.status || 400).json({
        message:
          err.response.data.message ||
          err.response.data.error ||
          "Out of stock"
      });
    }

    res.status(500).json({
      message: "Something went wrong while creating order"
    });
  }
};

// ✅ GET ALL ORDERS
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// ✅ GET ORDER BY ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error fetching order" });
  }
};

// ✅ GET USER ORDERS
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user orders" });
  }
};

// ✅ UPDATE STATUS (NEW FEATURE)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus
};