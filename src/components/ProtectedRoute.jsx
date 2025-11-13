// src/components/ProtectedRoute.jsx (Updated)

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  // ✅ Get the new loading state from the context
  const { user, loading } = useAuth();

  // ✅ Wait until the context is done loading
  if (loading) {
    // Show a loading spinner or null while we check auth
    return <div>Checking authentication...</div>; 
  }

  if (!user) {
    // User not logged in, redirect to login
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    // User does not have the required role, redirect to home
    return <Navigate to="/" />;
  }

  // All checks passed, render the protected component
  return children;
};

export default ProtectedRoute;