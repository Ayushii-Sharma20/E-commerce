const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/authorize");
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  getSellerOrders,
  getSellerAnalytics,
  getAdminAnalytics,
  updateOrderStatus,
  getOrderById
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", verifyToken, verifyRole(["buyer", "admin"]), createOrder);

router.get("/", verifyToken, verifyRole(["admin"]), getAllOrders);
router.get(
  "/admin/analytics",
  verifyToken,
  verifyRole(["admin"]),
  getAdminAnalytics
);
router.get("/user/:userId", verifyToken, verifyRole(["buyer", "admin"]), getUserOrders);
router.get("/seller/orders", verifyToken, verifyRole(["seller"]), getSellerOrders);
router.get(
  "/seller/analytics",
  verifyToken,
  verifyRole(["seller"]),
  getSellerAnalytics
);
router.get("/:id", verifyToken, verifyRole(["buyer", "seller", "admin"]), getOrderById);
router.patch(
  "/:id/status",
  verifyToken,
  verifyRole(["seller", "admin"]),
  updateOrderStatus
);
router.get(
  "/seller/:sellerId",
  verifyToken,
  verifyRole(["admin"]),
  getSellerOrders
);

module.exports = router;
