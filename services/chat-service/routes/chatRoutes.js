const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages
} = require("../controllers/chatController");

// ✅ SEND
router.post("/send", sendMessage);

// ✅ GET
router.get("/:userId", getMessages);

module.exports = router;