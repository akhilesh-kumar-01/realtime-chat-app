const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getMessages, sendMessage, clearChat } = require('../controllers/messageController');
const { verifyToken } = require('../middleware/authMiddleware');

// Configure multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/messages/:userId - Get chat history with a specific user
// Protected by verifyToken
router.get('/:userId', verifyToken, getMessages);

// POST /api/messages/:userId - Send a new message to a specific user
// Protected by verifyToken, and handles an optional file upload named 'image'
router.post('/:userId', verifyToken, upload.single('image'), sendMessage);

// DELETE /api/messages/:userId - Clear all messages between current user and specific user
router.delete('/:userId', verifyToken, clearChat);

module.exports = router;
