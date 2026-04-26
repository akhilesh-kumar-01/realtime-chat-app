const db = require('../config/db');
const { uploadImage } = require('../utils/cloudinary');
const socketHandler = require('../socket/socketHandler');

// Function to get all messages between the logged-in user and another selected user
const getMessages = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherUserId = req.params.userId;

    // Fetch messages where I am the sender and they are the receiver, OR vice versa
    // We order by created_at ASC so the oldest messages are at the top and newest at the bottom
    const [messages] = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?) 
       ORDER BY created_at ASC`,
      [myId, otherUserId, otherUserId, myId]
    );

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Get Messages Error:", error);
    return res.status(500).json({ message: "Server error fetching messages" });
  }
};

// Function to send a new message (text or image) to another user
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.userId;
    const { message } = req.body;
    let imageUrl = '';

    // If an image was attached, upload it to Cloudinary first
    if (req.file) {
      imageUrl = await uploadImage(req.file.path);
    }

    // Feature 3: Block Logic Enforcement
    // Check if the receiver has blocked the sender
    const [blocked] = await db.query(
      'SELECT * FROM user_relationships WHERE user_id = ? AND target_user_id = ? AND is_blocked = 1',
      [receiverId, senderId]
    );

    if (blocked.length > 0) {
      return res.status(403).json({ message: "You are blocked by this user" });
    }

    // Insert the new message into the MySQL database
    const [result] = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, message, image_url) VALUES (?, ?, ?, ?)',
      [senderId, receiverId, message || '', imageUrl]
    );

    // Fetch the newly created message so we can return it and send it via socket
    const [newMessages] = await db.query(
      'SELECT * FROM messages WHERE id = ?',
      [result.insertId]
    );
    const newMessage = newMessages[0];

    // Real-Time Socket.io Part:
    // Find out if the receiver is currently online (convert string receiverId to Number)
    const receiverSocketId = socketHandler.getSocketId(Number(receiverId));
    if (receiverSocketId && socketHandler.io) {
      // If they are online, send the message directly to their screen!
      socketHandler.io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Return the saved message to the sender so it shows up on their screen too
    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({ message: "Server error sending message" });
  }
};

// Function to completely clear conversation history between two users
const clearChat = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherUserId = req.params.userId;

    // Delete all messages globally (for both users)
    await db.query(
      `DELETE FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?)`,
      [myId, otherUserId, otherUserId, myId]
    );

    return res.status(200).json({ message: "Chat cleared successfully" });
  } catch (error) {
    console.error("Clear Chat Error:", error);
    return res.status(500).json({ message: "Server error clearing chat" });
  }
};

module.exports = { getMessages, sendMessage, clearChat };
