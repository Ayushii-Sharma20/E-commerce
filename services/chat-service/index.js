require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// routes
app.use("/chat", require("./routes/chatRoutes"));

app.listen(3006, () => {
  console.log("💬 Chat service running on port 3006");
});