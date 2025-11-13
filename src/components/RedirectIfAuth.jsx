// src/components/RedirectIfAuth.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RedirectIfAuth = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a blank loading screen while we check auth
    return <div>Loading...</div>;
  }

  if (user) {
    // If the user is already logged in, redirect them to the dashboard
    return <Navigate to="/dashboard" />;
  }

  // If the user is not logged in, show them the page (e.g., Login or Register)
  return children;
};

export default RedirectIfAuth;