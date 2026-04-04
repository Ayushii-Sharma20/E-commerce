const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");
const orderRoutes = require("./routes/OrderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// DB Connection
connectDB();

// Routes
app.use("/api/orders", orderRoutes);

// Test route (optional)
app.get("/", (req, res) => {
  res.send("Order Service Running 🚀");
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Order Service running on port ${process.env.PORT}`);
});