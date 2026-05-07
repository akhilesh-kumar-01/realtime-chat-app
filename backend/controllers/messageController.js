const Message = require('../models/Message');
const User = require('../models/User');
const { uploadImage } = require('../utils/cloudinary');
const socketHandler = require('../socket/socketHandler');

// Function to get messages between two users
const getMessages = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender_id: myId, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: myId }
      ]
    }).sort({ createdAt: 1 });

    // Add 'id' field for frontend compatibility
    const formattedMessages = messages.map(m => {
      const obj = m.toObject();
      obj.id = obj._id;
      obj.created_at = obj.createdAt;
      return obj;
    });

    return res.status(200).json(formattedMessages);
  } catch (error) {
    console.error("Get Messages Error:", error);
    return res.status(500).json({ message: "Server error fetching messages" });
  }
};

// Function to send a new message
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.userId;
    const { message } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = await uploadImage(req.file.buffer);
    }

    // Check if the receiver has blocked the sender
    const receiver = await User.findById(receiverId);
    if (receiver && receiver.blockedUsers.includes(senderId)) {
      return res.status(403).json({ message: "You are blocked by this user" });
    }

    // Create message
    const newMessage = new Message({
      sender_id: senderId,
      receiver_id: receiverId,
      message: message || '',
      image_url: imageUrl
    });

    await newMessage.save();

    const savedMessage = newMessage.toObject();
    savedMessage.id = savedMessage._id;
    savedMessage.created_at = savedMessage.createdAt;

    // Real-Time Socket.io
    const receiverSocketId = socketHandler.getSocketId(receiverId);
    if (receiverSocketId && socketHandler.io) {
      socketHandler.io.to(receiverSocketId).emit("newMessage", savedMessage);
    }

    return res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({ message: "Server error sending message" });
  }
};

// Function to clear chat
const clearChat = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherUserId = req.params.userId;

    await Message.deleteMany({
      $or: [
        { sender_id: myId, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: myId }
      ]
    });

    return res.status(200).json({ message: "Chat cleared successfully" });
  } catch (error) {
    console.error("Clear Chat Error:", error);
    return res.status(500).json({ message: "Server error clearing chat" });
  }
};

module.exports = { getMessages, sendMessage, clearChat };
