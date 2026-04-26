import React, { createContext, useContext, useState, useEffect } from 'react';
// We will create this 'api' instance in Step 2.8!
import api from '../utils/api';
import toast from 'react-hot-toast';

// Create the Context
const AuthContext = createContext();

// Create a custom hook so other components can easily access the auth state
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // State to store the logged-in user data
  const [authUser, setAuthUser] = useState(null);
  // State to check if we are currently verifying the token on page load
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // When the app loads, check if the user is already logged in
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if we have a token saved
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      // Fetch the user's profile from the backend
      const response = await api.get('/auth/me');
      setAuthUser(response.data);
    } catch (error) {
      console.error("Auth check failed:", error);
      // If the token is invalid or expired, clear it
      localStorage.removeItem('jwt_token');
      setAuthUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Save token to local storage so the user stays logged in
      localStorage.setItem('jwt_token', response.data.token);
      // Update state with user data
      setAuthUser(response.data.user);
      
      toast.success("Logged in successfully!");
      return true; // Return true so the login page knows it was successful
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      await api.post('/auth/register', { name, email, password });
      toast.success("Account created! You can now log in.");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    // Remove the token and clear the user state
    localStorage.removeItem('jwt_token');
    setAuthUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ authUser, isCheckingAuth, login, register, logout, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};
