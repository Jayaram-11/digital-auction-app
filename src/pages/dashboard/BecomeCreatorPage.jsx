// src/pages/dashboard/BecomeCreatorPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const BecomeCreatorPage = () => {
  const [formData, setFormData] = useState({
    mobile: '',
    upiId: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, refreshUser } = useAuth(); // Get our new refreshUser function
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // Call our new API endpoint
      const { data } = await axios.put(
        `${API_URL}/api/users/upgrade-to-creator`,
        formData, // Send the form data
        config
      );
      
      // Update the user in our context with the new data from the server
      refreshUser(data); 
      
      alert('Success! You are now a Creator.');
      navigate('/dashboard'); // Go back to the main dashboard

    } catch (err) {
      console.error('Failed to become creator', err);
      setError(err.response?.data?.message || 'Failed to submit details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <Link to="/" className="back-button" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        Back to Home
      </Link>
      
      <form onSubmit={handleSubmit}>
        <h2>Become a Creator</h2>
        <p>To receive payouts for your art, please provide your payment details.</p>
        
        <input type="tel" name="mobile" placeholder="Phone Number (e.g., 9876543210)" onChange={handleChange} required />
        <input type="text" name="upiId" placeholder="Your UPI ID (e.g., yourname@bank)" onChange={handleChange} required />
        <textarea 
          name="bio" 
          placeholder="A short bio about you as an artist..." 
          onChange={handleChange} 
          required 
          style={{ minHeight: '100px', resize: 'vertical' }}
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Become a Creator'}
        </button>
        {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default BecomeCreatorPage;