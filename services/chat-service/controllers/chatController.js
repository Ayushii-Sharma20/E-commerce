const Chat = require("../models/Chat");

const sendError = (res, statusCode, message, error = null) =>
  res.status(statusCode).json({
    success: false,
    message,
    error: error ? (typeof error === "string" ? error : error.message) : null
  });

const sendSuccess = (res, statusCode, message, data = {}) =>
  res.status(statusCode).json({
    success: true,
    message,
    ...data
  });

const normalizeParticipants = (firstId, secondId) => [String(firstId), String(secondId)].sort();

const isAllowedConversation = (currentRole, targetRole) => {
  const allowedTargets = {
    buyer: ["seller", "admin"],
    seller: ["buyer", "admin"],
    admin: ["buyer", "seller"]
  };

  return allowedTargets[currentRole]?.includes(targetRole);
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Chat.find({
      participants: req.user.userId
    }).sort({ lastMessageAt: -1 });

    const mappedConversations = conversations.map((conversation) => {
      const otherParticipantId = conversation.participants.find(
        (participantId) => participantId !== req.user.userId
      );
      const unreadCount = conversation.messages.filter(
        (message) =>
          message.senderId !== req.user.userId && !message.readBy.includes(req.user.userId)
      ).length;

      return {
        _id: conversation._id,
        otherParticipantId,
        otherParticipantRole: conversation.participantRoles.get(otherParticipantId),
        lastMessage:
          conversation.messages.length > 0
            ? conversation.messages[conversation.messages.length - 1]
            : null,
        unreadCount,
        updatedAt: conversation.updatedAt
      };
    });

    return sendSuccess(res, 200, "Conversations fetched successfully", {
      conversations: mappedConversations
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch conversations", error);
  }
};

exports.getConversationMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const participants = normalizeParticipants(req.user.userId, otherUserId);

    const conversation = await Chat.findOne({ participants });

    if (!conversation) {
      return sendSuccess(res, 200, "No messages found", {
        conversation: null,
        messages: []
      });
    }

    let updated = false;
    conversation.messages.forEach((message) => {
      if (message.senderId !== req.user.userId && !message.readBy.includes(req.user.userId)) {
        message.readBy.push(req.user.userId);
        updated = true;
      }
    });

    if (updated) {
      await conversation.save();
    }

    return sendSuccess(res, 200, "Messages fetched successfully", {
      conversation: {
        _id: conversation._id,
        participants: conversation.participants,
        participantRoles: Object.fromEntries(conversation.participantRoles)
      },
      messages: conversation.messages
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch messages", error);
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverRole, message } = req.body;

    if (!receiverId || !receiverRole || !message || !String(message).trim()) {
      return sendError(res, 400, "receiverId, receiverRole, and message are required");
    }

    if (!isAllowedConversation(req.user.role, receiverRole)) {
      return sendError(res, 403, "This conversation is not allowed for your role");
    }

    const participants = normalizeParticipants(req.user.userId, receiverId);
    let conversation = await Chat.findOne({ participants });

    if (!conversation) {
      conversation = await Chat.create({
        participants,
        participantRoles: new Map([
          [req.user.userId, req.user.role],
          [String(receiverId), String(receiverRole)]
        ]),
        messages: []
      });
    }

    conversation.messages.push({
      senderId: req.user.userId,
      senderRole: req.user.role,
      text: String(message).trim(),
      readBy: [req.user.userId]
    });
    conversation.lastMessageAt = new Date();

    if (!conversation.participantRoles.get(req.user.userId)) {
      conversation.participantRoles.set(req.user.userId, req.user.role);
    }
    if (!conversation.participantRoles.get(String(receiverId))) {
      conversation.participantRoles.set(String(receiverId), String(receiverRole));
    }

    await conversation.save();

    return sendSuccess(res, 201, "Message sent successfully", {
      conversationId: conversation._id,
      message: conversation.messages[conversation.messages.length - 1]
    });
  } catch (error) {
    return sendError(res, 500, "Failed to send message", error);
  }
};
