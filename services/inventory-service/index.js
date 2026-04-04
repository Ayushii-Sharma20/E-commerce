require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// DB connect
connectDB();

// routes
app.use("/api/inventory", require("./routes/inventoryRoutes"));

// ✅ THIS PART IS MUST
const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`Inventory Service running on port ${PORT}`);
});
console.log(require("./routes/inventoryRoutes"));