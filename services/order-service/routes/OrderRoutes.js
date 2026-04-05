const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getUserOrders,
  getOrderById   
} = require("../controllers/orderController");;

// Create order
router.post("/", createOrder);

// Get all orders
router.get("/", getOrders);

// Get user orders
router.get("/user/:userId", getUserOrders);
router.get("/:id", getOrderById);


module.exports = router;