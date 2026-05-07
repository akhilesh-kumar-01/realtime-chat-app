import axios from 'axios';

// Create a custom axios instance with our backend URL
// This saves us from typing the URL every single time
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://realtime-chat-app-34u8.onrender.com/api',
});

// Add an interceptor to the request
// Think of this as a checkpoint that every request goes through before leaving the frontend
api.interceptors.request.use(
  (config) => {
    // Look inside the browser's local storage for a saved token
    const token = localStorage.getItem('jwt_token');
    
    // If we find a token, attach it to the Authorization header like a VIP pass
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // If something goes wrong before the request is even sent, just return the error
    return Promise.reject(error);
  }
);

// Add a response interceptor to catch 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('jwt_token');
      // Redirect to login page on expired/invalid token
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
