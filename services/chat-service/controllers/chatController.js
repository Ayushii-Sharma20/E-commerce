const Chat = require("../models/Chat");

// ✅ SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message || !message.trim()) {
      return res.status(400).json({ error: "All fields required" });
    }

    const chat = await Chat.create({
      senderId,
      receiverId,
      message: message.trim(),
    });

    res.status(201).json(chat);
  } catch (err) {
    console.error(err); // 👈 helps debugging
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET CHAT FOR USER
exports.getMessages = async (req, res) => {
  try {
    const userId = req.params.userId;

    const messages = await Chat.find({
      $or: [
        { senderId: userId },
        { receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};