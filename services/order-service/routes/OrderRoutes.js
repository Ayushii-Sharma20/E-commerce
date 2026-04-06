const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus
} = require("../controllers/orderController");

// ✅ CREATE
router.post("/", createOrder);

// ✅ GET
router.get("/", getOrders);
router.get("/user/:userId", getUserOrders);

// ✅ IMPORTANT: before :id
router.patch("/status/:id", updateOrderStatus);

router.get("/:id", getOrderById);

module.exports = router;