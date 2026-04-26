const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendWelcomeEmail } = require('../utils/sendEmail');
require('dotenv').config();

// Function to handle new user registration
const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    // 1. Check if the user provided all required fields
    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "Please provide name, username, email, and password" });
    }

    // 2. Check if the email or username is already registered in our database
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUsers.length > 0) {
      const isEmailTaken = existingUsers.some(u => u.email === email);
      return res.status(400).json({ 
        message: isEmailTaken ? "User with this email already exists" : "Username is already taken" 
      });
    }

    // 3. Hash the password for security (10 rounds of salt)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Insert the new user into the database
    await db.query(
      'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)',
      [name, username, email, hashedPassword]
    );

    // 5. Send a welcome email in the background
    sendWelcomeEmail(email, name);

    // 6. Return a success message
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

// Function to handle user login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // 2. Find the user in the database by their email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const user = users[0];

    // 3. Compare the typed password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 4. Create a JWT token so the user can stay logged in (expires in 7 days)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Remove the password from the user object before sending it to frontend
    delete user.password;

    // 6. Return the token and the user data
    return res.status(200).json({ token, user });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// Function to get the current logged-in user's profile
const getMe = async (req, res) => {
  try {
    // req.user comes from our authMiddleware
    const userId = req.user.id;

    // Find the user by ID
    const [users] = await db.query('SELECT id, name, email, profile_pic, created_at FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user object
    return res.status(200).json(users[0]);
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({ message: "Server error fetching user profile" });
  }
};

module.exports = { register, login, getMe };
