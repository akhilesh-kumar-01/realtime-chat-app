import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Create the Context
const SocketContext = createContext();

// Create a custom hook so other components can easily access the socket state
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  // State to hold the live socket connection
  const [socket, setSocket] = useState(null);
  // State to hold an array of user IDs who are currently online
  const [onlineUsers, setOnlineUsers] = useState([]);

  // We need to know if the user is logged in or not
  const { authUser } = useAuth();

  useEffect(() => {
    // If the user is logged in, we connect to the socket server
    if (authUser) {
      const socketConnection = io("http://localhost:5000");

      setSocket(socketConnection);

      // Once connected, tell the server "I am online" using my user ID
      socketConnection.on("connect", () => {
        socketConnection.emit("userOnline", authUser.id);
      });

      // Listen for the server telling us who is online
      socketConnection.on("onlineUsers", (users) => {
        setOnlineUsers(users);
      });

      // Cleanup function: when the user logs out or closes the app, disconnect cleanly
      return () => {
        socketConnection.disconnect();
      };
    } else {
      // If the user logs out, make sure we disconnect the socket and clear the state
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]); // Re-run this effect whenever 'authUser' changes (login/logout)

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
