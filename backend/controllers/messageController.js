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
    // Find out if the receiver is currently online
    const receiverSocketId = socketHandler.getSocketId(receiverId);
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

module.exports = { getMessages, sendMessage };
