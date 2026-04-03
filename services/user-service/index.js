const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/users", userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`User Service running on port ${process.env.PORT}`);
});