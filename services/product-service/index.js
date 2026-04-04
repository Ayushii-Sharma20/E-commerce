require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./db");
const productRoutes = require("./routes/productRoutes"); // ✅ ADD THIS

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 CONNECT DATABASE
connectDB();

// ✅ ADD THIS LINE (VERY IMPORTANT)
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Product Service Running 🚀");
});

const PORT = 3002;

app.listen(PORT, () => {
  console.log(`🚀 Product Service running on port ${PORT}`);
});