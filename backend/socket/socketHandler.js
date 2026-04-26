// We need to keep a list of who is currently online
// A Map is like an object, but it's better for keeping track of key-value pairs (userId -> socketId)
const onlineUsers = new Map();

// We will also export the 'io' instance so our messageController can use it to send messages
let ioInstance;

// This function starts listening to socket connections
const initSocket = (io) => {
  ioInstance = io; // Save the io instance for later use

  // When a new user connects to our socket server (usually when they open the app)
  io.on('connection', (socket) => {
    console.log(`New socket connected: ${socket.id}`);

    // Listen for when the frontend tells us a specific user has logged in
    socket.on('userOnline', (userId) => {
      // Save their userId and their current socket.id
      onlineUsers.set(userId, socket.id);
      
      // Tell EVERYONE connected who is currently online by sending an array of userIds
      // Array.from(onlineUsers.keys()) gives us [userId1, userId2, ...]
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    // When the user closes the app or disconnects
    socket.on('disconnect', () => {
      // Find which userId belongs to this socket.id and remove them from the map
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      // Tell EVERYONE the updated list of online users
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};

// A helper function to easily find a user's socket ID by their user ID
const getSocketId = (userId) => {
  return onlineUsers.get(userId);
};

module.exports = { 
  initSocket, 
  getSocketId,
  // We use a getter to safely export the io instance even if it's set later
  get io() { return ioInstance; } 
};
