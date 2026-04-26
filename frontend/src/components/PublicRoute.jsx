import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute({ children }) {
  const { authUser, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-iosLightGray">
        <div className="text-iosGray font-medium">Loading...</div>
      </div>
    );
  }

  // If user is already logged in, redirect them to the chat page
  if (authUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}
