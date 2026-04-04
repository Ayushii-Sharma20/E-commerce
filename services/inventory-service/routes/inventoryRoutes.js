const express = require("express");
const router = express.Router();

const {
  getStock,
  updateStock,
  reserveStock,
  confirmStock,
  releaseStock
} = require("../controllers/inventoryController");

router.get("/:productId", getStock);
router.post("/update", updateStock);
router.post("/reserve", reserveStock);
router.post("/confirm", confirmStock);
router.post("/release", releaseStock);

module.exports = router;
console.log(getStock);