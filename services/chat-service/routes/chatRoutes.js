const express = require("express");

const {
  getConversations,
  getConversationMessages,
  sendMessage
} = require("../controllers/chatController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/conversations", verifyToken, getConversations);
router.get("/messages/:otherUserId", verifyToken, getConversationMessages);
router.post("/send", verifyToken, sendMessage);

module.exports = router;
