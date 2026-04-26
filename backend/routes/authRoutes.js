const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - Login a user
router.post('/login', login);

// GET /api/auth/me - Get the logged-in user's profile
// This route is protected by the verifyToken middleware
router.get('/me', verifyToken, getMe);

module.exports = router;
