// src/pages/AdminPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // ✅ Import Link

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AdminPage = () => {
  const [pendingAuctions, setPendingAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const handleStatusUpdate = async (id, status) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.put(`${API_URL}/api/auctions/${id}/status`, { status }, config);
      setPendingAuctions((prev) => prev.filter((auction) => auction._id !== id));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status.');
    }
  };

  useEffect(() => {
    const fetchPendingAuctions = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/api/auctions/pending`, config);
        setPendingAuctions(data);
      } catch (error) {
        console.error('Failed to fetch pending auctions', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchPendingAuctions();
    } else {
      setLoading(false);
    }
  }, [user?.role, user?.token]);

  if (loading) return <div>Loading pending approvals...</div>;

  if (user?.role !== 'admin') {
    return <div>You do not have permission to view this page.</div>;
  }

  return (
    <div className="admin-panel" style={{ padding: '0 2rem' }}>
      {/* ✅ Added Back to Home navigation */}
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

      <h2>Pending Artwork Approvals</h2>

      {pendingAuctions.length === 0 ? (
        <p>No artworks are currently pending approval.</p>
      ) : (
        <div className="pending-list">
          {pendingAuctions.map((auction) => (
            <div key={auction._id} className="pending-item-card">
              <img
                src={auction.imageUrl}
                alt={auction.title}
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
              <div className="item-details">
                <h3>{auction.title}</h3>

                {/* ✅ Safe optional chaining to avoid crashes */}
                <p>
                  <strong>Creator:</strong>{' '}
                  {auction.creator?.name || 'User Deleted'} (
                  {auction.creator?.email || 'N/A'})
                </p>

                <p>
                  <strong>Description:</strong> {auction.description}
                </p>
                <p>
                  <strong>Starting Price:</strong> ₹{auction.starting_price}
                </p>
              </div>
              <div className="item-actions">
                <button
                  className="approve-btn"
                  onClick={() => handleStatusUpdate(auction._id, 'active')}
                >
                  Approve
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleStatusUpdate(auction._id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
