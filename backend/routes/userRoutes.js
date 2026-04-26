const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllUsers, updateProfile, updateRelationship, deleteAccount } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Configure multer to temporarily save uploaded files in an 'uploads' folder
const upload = multer({ dest: 'uploads/' });

// GET /api/users - Get all users (for the sidebar)
// Protected by verifyToken middleware
router.get('/', verifyToken, getAllUsers);

// PUT /api/users/profile - Update the logged-in user's profile
// Protected by verifyToken, and uses multer to handle a single file upload named 'profilePic'
router.put('/profile', verifyToken, upload.single('profilePic'), updateProfile);

// POST /api/users/:targetId/relationship - Block/Unblock/Mute/Unmute
router.post('/:targetId/relationship', verifyToken, updateRelationship);

// DELETE /api/users/profile - Delete logged-in user's account
router.delete('/profile', verifyToken, deleteAccount);

module.exports = router;
