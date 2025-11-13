// src/pages/dashboard/SubmitShippingPage.jsx

import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const SubmitShippingPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    printDimensions: 'A4 (8.3 x 11.7 in)',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orderId } = useParams(); // Extract the order ID from the URL

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { printDimensions } = formData;
    const shippingDetails = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
    };

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(
        `${API_URL}/api/orders/${orderId}/submit-details`,
        { shippingDetails, printDimensions },
        config
      );
      alert('Shipping details submitted successfully!');
      navigate('/dashboard/my-winnings');
    } catch (err) {
      console.error('Failed to submit details', err);
      setError(err.response?.data?.message || 'Failed to submit details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      {/* ✅ Added Back to Home link for better navigation */}
      <Link
        to="/"
        className="back-button"
        style={{ marginBottom: '1rem', display: 'inline-block' }}
      >
        Back to Home
      </Link>

      <form onSubmit={handleSubmit}>
        <h2>Shipping Details</h2>
        <p>Please enter the details for your art print.</p>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Street Address"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="state"
          placeholder="State / Province"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="postalCode"
          placeholder="Postal Code"
          onChange={handleChange}
          required
        />

        <label>Select Print Dimensions:</label>
        <select
          name="printDimensions"
          value={formData.printDimensions}
          onChange={handleChange}
        >
          <option value="A5 (5.8 x 8.3 in)">A5 (5.8 x 8.3 in)</option>
          <option value="A4 (8.3 x 11.7 in)">A4 (8.3 x 11.7 in)</option>
          <option value="A3 (11.7 x 16.5 in)">A3 (11.7 x 16.5 in)</option>
          <option value="12 x 18 in">12 x 18 in (Poster)</option>
          <option value="24 x 36 in">24 x 36 in (Large Poster)</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Shipping Details'}
        </button>

        {error && (
          <p className="error-message" style={{ color: 'red' }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default SubmitShippingPage;
