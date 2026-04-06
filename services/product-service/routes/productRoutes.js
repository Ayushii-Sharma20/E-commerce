const express = require("express");
const router = express.Router();

const controller = require("../controllers/productController");

// DEBUG
console.log(controller);

// ✅ CREATE + GET ALL
router.post("/", controller.createProduct);
router.get("/", controller.getProducts);

// ✅ IMPORTANT: Put this BEFORE :id
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const Product = require("../models/Product");

    const products = await Product.find({
      sellerId: req.params.sellerId
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ OTHER ROUTES
router.get("/:id", controller.getProductById);
router.put("/:id", controller.updateProduct);
router.delete("/:id", controller.deleteProduct);

module.exports = router;