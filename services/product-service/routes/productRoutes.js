const express = require("express");

const controller = require("../controllers/productController");
const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/authorize");

const router = express.Router();

router.get("/", controller.getProducts);
router.get("/admin/all", verifyToken, verifyRole(["admin"]), controller.getAllProducts);
router.get("/seller/me", verifyToken, verifyRole(["seller"]), controller.getMyProducts);
router.get("/:id", controller.getProductById);

router.post("/", verifyToken, verifyRole(["seller", "admin"]), controller.createProduct);
router.put(
  "/:id",
  verifyToken,
  verifyRole(["seller", "admin"]),
  controller.updateProduct
);
router.delete(
  "/:id",
  verifyToken,
  verifyRole(["seller", "admin"]),
  controller.deleteProduct
);
router.patch(
  "/:id/approve",
  verifyToken,
  verifyRole(["admin"]),
  controller.approveProduct
);

module.exports = router;
