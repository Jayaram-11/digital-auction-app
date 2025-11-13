// src/pages/dashboard/MyWinningsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// This is our Winnings Card
const WinningsCard = ({ order }) => {
  const { auctionItem } = order;

  // We don't need the null check here anymore because
  // we will filter them out before they get here.

  const renderStatus = () => {
    switch (order.orderStatus) {
      case 'Pending Shipping Details':
        return (
          <Link 
            to={`/dashboard/submit-shipping/${order._id}`} 
            className="bid-button" 
            style={{ textDecoration: 'none', backgroundColor: '#FF6E00' }}
          >
            Enter Shipping Details
          </Link>
        );
      case 'Pending Shipment':
        return <p style={{ color: 'blue', fontWeight: 'bold' }}>Shipping details submitted. Awaiting shipment.</p>;
      case 'Shipped':
        return <p style={{ color: 'green', fontWeight: 'bold' }}>Your item has been shipped!</p>;
      default:
        return null;
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
      <img 
        src={auctionItem.imageUrl} 
        alt={auctionItem.title} 
        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} 
      />
      <div>
        <h3 style={{ marginTop: 0 }}>{auctionItem.title}</h3>
        <p>by {auctionItem.artistName || auctionItem.creator?.name || 'Unknown Artist'}</p>
        <p><strong>Won at: ₹{order.finalAmount}</strong></p>
        {renderStatus()}
      </div>
    </div>
  );
};

// This is the main page component
const MyWinningsPage = () => {
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWinnings = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/api/orders/my-winnings`, config);
        
        // ✅ --- THE FIX --- ✅
        // Filter out any orders where the auctionItem is null (deleted)
        // This stops the "Auction Data Not Found" cards from appearing
        const validOrders = data.filter(order => order.auctionItem !== null);
        
        setWinnings(validOrders);
      } catch (error) {
        console.error('Failed to fetch winnings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWinnings();
  }, [user.token]);

  return (
    <div style={{ padding: '0 2rem' }}>
      <Link to="/" className="back-button" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        Back to Home
      </Link>
      
      <h2>My Winnings</h2>
      
      {loading && <p>Loading your winnings...</p>}
      
      {!loading && winnings.length === 0 && (
        <p>You have not won any auctions yet. Start bidding!</p>
      )}
      
      {!loading && winnings.length > 0 && (
        <div>
          {winnings.map(order => (
            <WinningsCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyWinningsPage;