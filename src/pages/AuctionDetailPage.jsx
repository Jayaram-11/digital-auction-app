// src/pages/AuctionDetailPage.jsx (FIXED input bug)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuctionTimer from '../components/AuctionTimer';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ✅ --- NEW COMPONENT --- ✅
// Moving this outside prevents unnecessary re-renders that cause input focus loss.
const AuctionStatusBlock = React.memo(({
  auction,
  user,
  minNextBid,
  bidAmount,
  onBidAmountChange,
  onPlaceBid
}) => {
  const isAuctionActive = auction.auction_state === 'active';

  // CASE 1: Auction is active
  if (isAuctionActive) {
    if (user) {
      if (user.role === 'bidder') {
        return (
          <>
            <input
              type="number"
              className="bid-input"
              placeholder={`Enter ₹${minNextBid} or more`}
              value={bidAmount}
              onChange={(e) => onBidAmountChange(e.target.value)}
            />
            <button className="bid-button-large" onClick={onPlaceBid}>
              Place Your Bid
            </button>
          </>
        );
      } else {
        return <div className="auction-ended-message">Only bidders can place bids.</div>;
      }
    } else {
      return (
        <div className="auction-ended-message">
          <Link to="/login">Please login to place a bid.</Link>
        </div>
      );
    }
  }

  // CASE 2: SOLD
  if (auction.auction_state === 'sold') {
    return (
      <div className="auction-ended-message" style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
        SOLD for ₹{auction.currentBid} to {auction.winner?.name || 'a lucky bidder'}!
      </div>
    );
  }

  // CASE 3: UNSOLD or REJECTED
  if (auction.auction_state === 'unsold' || auction.auction_state === 'rejected') {
    return (
      <div className="auction-ended-message" style={{ fontSize: '1.2em' }}>
        This auction has ended.
      </div>
    );
  }

  // Default fallback
  return <div className="auction-ended-message">This auction has ended.</div>;
});
// ✅ --- END NEW COMPONENT --- ✅


const AuctionDetailPage = ({ auctions, socket }) => {
  const { id } = useParams();
  const { user } = useAuth();

  const auction = auctions.find((a) => a._id === id);

  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (socket && id) {
      socket.emit('joinAuction', id);
    }
  }, [socket, id]);

  if (!auction) {
    return <div>Loading auction details...</div>;
  }

  const isAuctionActive = auction.auction_state === 'active';
  const minNextBid = auction.currentBid + 10;

  const placeBid = async () => {
    const newBid = parseInt(bidAmount);
    if (isNaN(newBid) || newBid < minNextBid) {
      setError(`Your bid must be at least ₹${minNextBid}.`);
      return;
    }
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post(`${API_URL}/api/auctions/${id}/bids`, { bidAmount: newBid }, config);
      setBidAmount('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="auction-detail-page">
      <Link to="/" className="back-button">Back</Link>

      <div className="detail-info-bar">
        <div className="current-bid-box">
          <span className="label">Current Bid</span>
          <span className="value-large">₹{auction.currentBid}</span>
        </div>
        <div className="timer-box">
          <span>🕒</span> <AuctionTimer endTime={auction.endTime} />
        </div>
      </div>

      <div className="detail-art-container">
        <img src={auction.imageUrl} alt={auction.title} className="detail-art-image" />
      </div>

      {/* ✅ Updated bidding section */}
      <div className="bidding-section">
        <AuctionStatusBlock
          auction={auction}
          user={user}
          minNextBid={minNextBid}
          bidAmount={bidAmount}
          onBidAmountChange={setBidAmount}
          onPlaceBid={placeBid}
        />
      </div>

      {/* ✅ Wallet info */}
      {user && user.role === 'bidder' && isAuctionActive && (
        <div className="wallet-info" style={{ marginTop: '1rem', color: '#ccc' }}>
          Your Wallet Balance: <strong>₹{user.wallet_balance || 0}</strong>
        </div>
      )}

      {error && <p className="error-message" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      <div className="detail-text-info">
        <h2>{auction.title}</h2>
        <p className="creator-name">
          by {auction.artistName || auction.creator?.name || 'Unknown Artist'}
        </p>
        <p className="description">{auction.description}</p>
      </div>
    </div>
  );
};

export default AuctionDetailPage;
