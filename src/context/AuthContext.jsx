// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const INDICART_MAIN_SITE_URL = 'http://localhost:5173'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); 
  }, []); 

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/users/login`, {
        email,
        password,
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.removeItem('sso_user');
      setUser(data); 
      if (data.role === 'bidder') {
        navigate('/'); 
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed', error.response?.data?.message);
      alert(error.response?.data?.message || 'Login failed.');
    }
  }, [navigate]);

  const register = useCallback(async (name, email, password) => {
    try {
      await axios.post(`${API_URL}/api/users/register`, {
        name,
        email,
        password,
      });
      alert('Registration successful! Please log in.');
      navigate('/login'); 
    } catch (error) {
      console.error('Registration failed', error.response?.data?.message);
      alert(error.response?.data?.message || 'Registration failed.');
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('userInfo');
    setUser(null);
    const isSsoUser = localStorage.getItem('sso_user');
    if (isSsoUser) {
      localStorage.removeItem('sso_user');
      window.location.href = `${INDICART_MAIN_SITE_URL}/auth/sso-logout`;
    } else {
      navigate('/login');
    }
  }, [navigate]);
  
  const updateWalletBalance = useCallback((newBalance) => {
    setUser((currentUser) => {
      const updatedUser = { ...currentUser, wallet_balance: newBalance };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const ssoLogin = useCallback(async (token) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/users/sso-login`, { token });
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('sso_user', 'true');
      setUser(data);
      return data;       
    } catch (error) {
      console.error('SSO Login failed', error.response?.data?.message);
      throw new Error(error.response?.data?.message || 'SSO Login Failed');
    }
  }, []);

  // ✅ --- NEW FUNCTION ---
  // A simple function to update the user in context
  const refreshUser = useCallback((newUserData) => {
    localStorage.setItem('userInfo', JSON.stringify(newUserData));
    setUser(newUserData);
  }, []);
  // ✅ --- END NEW FUNCTION ---

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    updateWalletBalance,
    ssoLogin,
    refreshUser, // ✅ Export the new function
  }), [user, loading, login, register, logout, updateWalletBalance, ssoLogin, refreshUser]); 

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};