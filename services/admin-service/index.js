const express = require("express");
const app = express();

app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Admin Service Running 🚀");
});

// IMPORTANT: this keeps server alive
app.listen(3007, () => {
  console.log("Admin Service running on port 3007");
});