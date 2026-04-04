const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getUserOrders
} = require("../controllers/orderController");

// Create order
router.post("/", createOrder);

// Get all orders
router.get("/", getOrders);

// Get user orders
router.get("/:userId", getUserOrders);

module.exports = router;