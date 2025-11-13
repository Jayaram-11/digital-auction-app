// src/pages/dashboard/ShippingQueuePage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// This is the card for a single shipping order
const ShippingOrderCard = ({ order }) => {
  const { shippingDetails, printDimensions, auctionItem, winner } = order;

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
      <h3 style={{ marginTop: 0 }}>Item: {auctionItem.title}</h3>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <img 
          src={auctionItem.imageUrl} 
          alt={auctionItem.title} 
          style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '4px' }} 
        />
        <div>
          <h4><strong>Ship To:</strong></h4>
          <p>
            {shippingDetails.name}<br />
            {shippingDetails.phone}<br />
            {shippingDetails.address}<br />
            {shippingDetails.city}, {shippingDetails.state} {shippingDetails.postalCode}
          </p>
        </div>
        <div>
          <h4><strong>Order Details:</strong></h4>
          <p><strong>Winner:</strong> {winner.name} ({winner.email})</p>
          <p><strong>Print Dimensions:</strong> {printDimensions}</p>
        </div>
      </div>
    </div>
  );
};

// This is the main page component
const ShippingQueuePage = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/api/orders/shipping-queue`, config);
        setQueue(data);
      } catch (error) {
        console.error('Failed to fetch shipping queue', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, [user.token]);

  return (
    <div style={{ padding: '0 2rem' }}>
      {/* ✅ Using Link component for "Back to Home" */}
      <Link to="/" className="back-button" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        Back to Home
      </Link>
      
      <h2>Shipping Queue</h2>
      <p>These items have been paid for and are awaiting shipment.</p>
      
      {loading && <p>Loading shipping queue...</p>}
      
      {!loading && queue.length === 0 && (
        <p>There are no orders awaiting shipment right now.</p>
      )}
      
      {!loading && queue.length > 0 && (
        <div>
          {queue.map(order => (
            <ShippingOrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShippingQueuePage;