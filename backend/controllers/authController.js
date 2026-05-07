const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
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

    // 2. Check if the email or username is already registered
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? "User with this email already exists" : "Username is already taken" 
      });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create and save the new user
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // 5. Send welcome email
    sendWelcomeEmail(email, name);

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

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // 2. Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 4. Create JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Convert to object and remove password
    const userData = user.toObject();
    delete userData.password;
    
    // Add compatibility fields
    userData.id = userData._id;
    userData.created_at = userData.createdAt;

    return res.status(200).json({ token, user: userData });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// Function to get current user profile
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = user.toObject();
    userData.id = userData._id;
    userData.created_at = userData.createdAt;

    return res.status(200).json(userData);
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({ message: "Server error fetching user profile" });
  }
};

module.exports = { register, login, getMe };
