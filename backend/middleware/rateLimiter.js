const rateLimit = require('express-rate-limit');

// Create a rate limiter middleware to prevent spam or DDoS attacks
// It limits each IP address to a maximum number of requests in a given time
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    message: "Too many requests, please try again later"
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = { apiLimiter };
