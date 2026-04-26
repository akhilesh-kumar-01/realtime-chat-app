const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import our routes, middlewares, and socket handler
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { initSocket } = require('./socket/socketHandler');

// 1. Setup Express app
const app = express();

// 2. Add basic middlewares
// Enable CORS so our frontend (running on a different port) can talk to this backend
app.use(cors());
// Allow our app to read JSON data from incoming requests
app.use(express.json());

// 3. Apply the rate limiter to all API routes to prevent spam
app.use('/api', apiLimiter);

// 4. Mount our routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// A simple test route to check if server is running
app.get('/', (req, res) => {
  res.send('ChatApp Backend is running!');
});

// 5. Create HTTP server from the Express app
// We need this so Socket.io can attach to it
const server = http.createServer(app);

// 6. Attach Socket.io to the HTTP server
// Allow cross-origin requests (*) so frontend can connect to the socket
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 7. Initialize our custom socket logic
initSocket(io);

// 8. Start the server on the PORT from our .env file (or default to 5000)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
