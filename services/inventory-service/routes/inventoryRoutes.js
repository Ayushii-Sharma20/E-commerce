const express = require("express");
const router = express.Router();

const {
  createInventory,
  getStock,
  updateStock,
  reserveStock,
  confirmStock,
  releaseStock
} = require("../controllers/inventoryController");

router.post("/", createInventory);
router.get("/:productId", getStock);
router.post("/update", updateStock);
router.post("/reserve", reserveStock);
router.post("/confirm", confirmStock);
router.post("/release", releaseStock);

module.exports = router;
