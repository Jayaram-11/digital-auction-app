// src/pages/dashboard/MyUploadsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// This helper component renders the price info
const PriceInfo = ({ auction }) => {
  // ✅ --- UPDATED LOGIC --- ✅
  switch (auction.auction_state) {
    case 'sold':
      return (
        <div style={{ fontSize: '0.9em' }}>
          <p style={{ margin: '4px 0', color: 'green', fontWeight: 'bold' }}>
            Winning Bid: ₹{auction.currentBid}
          </p>
          <p style={{ margin: '4px 0', color: 'red' }}>
            Platform Fee: -₹{auction.commissionAmount}
          </p>
          <p style={{ margin: '4px 0', fontWeight: 'bold', borderTop: '1px solid #eee', paddingTop: '4px' }}>
            Your Payout: ₹{auction.creatorPayout}
          </p>
        </div>
      );
    case 'unsold':
    case 'rejected':
      return (
        <p><strong>Starting Price:</strong> ₹{auction.starting_price}</p>
      );
    case 'active':
    case 'pending_approval':
    default:
      return (
        <p><strong>Current Bid:</strong> ₹{auction.currentBid}</p>
      );
  }
  // ✅ --- END UPDATED LOGIC --- ✅
};

// This is the card component
const UploadCard = ({ auction }) => {
  let statusColor = '';
  switch (auction.auction_state) {
    case 'active': statusColor = 'green'; break;
    case 'pending_approval': statusColor = 'orange'; break;
    case 'sold': statusColor = 'blue'; break;
    case 'rejected': statusColor = 'red'; break;
    default: statusColor = 'grey';
  }

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
      <img src={auction.imageUrl} alt={auction.title} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
      <div>
        <h3 style={{ marginTop: 0 }}>{auction.title}</h3>
        <p style={{ color: statusColor, fontWeight: 'bold', textTransform: 'capitalize' }}>
          Status: {auction.auction_state.replace('_', ' ')}
        </p>
        
        {/* Use the updated PriceInfo component */}
        <PriceInfo auction={auction} />
        
      </div>
    </div>
  );
};


const MyUploadsPage = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/api/auctions/my-uploads`, config);
        setUploads(data);
      } catch (error) {
        console.error('Failed to fetch uploads', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUploads();
  }, [user.token]);

  return (
    <div style={{ padding: '0 2rem' }}>
      <Link to="/" className="back-button" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        Back to Home
      </Link>
      
      <h2>My Uploaded Arts</h2>
      
      {loading && <p>Loading your uploads...</p>}
      
      {!loading && uploads.length === 0 && (
        <p>You have not uploaded any arts yet. Click 'Upload New Art' to get started!</p>
      )}
      
      {!loading && uploads.length > 0 && (
        <div>
          {uploads.map(auction => (
            <UploadCard key={auction._id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyUploadsPage;