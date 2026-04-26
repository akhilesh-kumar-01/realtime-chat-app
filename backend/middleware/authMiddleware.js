const jwt = require('jsonwebtoken');
require('dotenv').config();

// Function to verify if the user has a valid JWT token
// This acts as a security check before allowing access to private routes
const verifyToken = async (req, res, next) => {
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.authorization;

    // Check if the header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided, access denied" });
    }

    // Extract the token part (remove "Bearer " from the string)
    const token = authHeader.split(' ')[1];

    // Verify the token using our secret key
    // This will throw an error if the token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user information to the request object
    // This allows the next functions to know who is making the request
    req.user = decoded;

    // Call next() to pass control to the next function (the actual route handler)
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token, access denied" });
  }
};

module.exports = { verifyToken };
