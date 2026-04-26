const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getMessages, sendMessage } = require('../controllers/messageController');
const { verifyToken } = require('../middleware/authMiddleware');

// Configure multer for temporary file storage
const upload = multer({ dest: 'uploads/' });

// GET /api/messages/:userId - Get chat history with a specific user
// Protected by verifyToken
router.get('/:userId', verifyToken, getMessages);

// POST /api/messages/:userId - Send a new message to a specific user
// Protected by verifyToken, and handles an optional file upload named 'image'
router.post('/:userId', verifyToken, upload.single('image'), sendMessage);

module.exports = router;
