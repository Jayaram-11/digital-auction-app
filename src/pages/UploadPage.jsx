// src/pages/UploadPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // ✅ Import Link

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const UploadPage = () => {
  // ✅ State management
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [description, setDescription] = useState('');
  const [starting_price, setStartingPrice] = useState('');
  const [duration, setDuration] = useState('10m');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setError('Please select an image file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ Step 1: Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

      const imageUrl = cloudinaryRes.data.secure_url;

      // ✅ Step 2: Send auction details to backend
      const auctionData = {
        title,
        artistName,
        description,
        starting_price: Number(starting_price),
        duration,
        imageUrl,
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post(`${API_URL}/api/auctions`, auctionData, config);

      alert('Artwork submitted for approval!');
      navigate('/dashboard/my-uploads'); // ✅ Redirect after success
    } catch (err) {
      console.error('Upload failed', err);
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ padding: '0 2rem' }}>
      {/* ✅ Back to Home link */}
      <Link
        to="/"
        className="back-button"
        style={{
          marginBottom: '1rem',
          display: 'inline-block',
          textDecoration: 'none',
          color: '#007bff',
        }}
      >
        ← Back to Home
      </Link>

      <form onSubmit={handleSubmit}>
        <h2>Upload Your Artwork</h2>

        <input
          type="text"
          placeholder="Artwork Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Artist Name (for display)"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          required
        />

        <textarea
          placeholder="Short description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Starting Price (₹)"
          value={starting_price}
          onChange={(e) => setStartingPrice(e.target.value)}
          required
        />

        <label>Auction Duration:</label>
        <select value={duration} onChange={(e) => setDuration(e.target.value)}>
          <option value="10m">10 Minutes</option>
          <option value="30m">30 Minutes</option>
          <option value="1h">1 Hour</option>
        </select>

        <label>Artwork Image:</label>
        <input
          type="file"
          onChange={(e) => setImageFile(e.target.files[0])}
          accept="image/png, image/jpeg, image/jpg"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </button>

        {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default UploadPage;
