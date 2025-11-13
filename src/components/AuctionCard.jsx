// src/components/AuctionCard.jsx (Fully Updated)

import React from 'react';
import { Link } from 'react-router-dom';
import AuctionTimer from './AuctionTimer';

const AuctionCard = ({ auction }) => {
  const isAuctionEnded = new Date(auction.endTime) < new Date();

  return (
    <div className={`auction-card ${isAuctionEnded ? 'ended' : ''}`}>
      <Link to={`/auction/${auction._id}`} className="card-link-wrapper">
        <img src={auction.imageUrl} alt={auction.title} className="auction-image" />
        <div className="auction-details">
          <h3>{auction.title}</h3>
 
          <p>by {auction.artistName || auction.creator?.name || 'Unknown Artist'}</p>
          <div className="auction-info">
            <div>
              <span className="label">Current Bid</span>
              <span className="value">₹{auction.currentBid}</span>
            </div>
            <div>
              <span className="label">Ends In</span>
              <AuctionTimer endTime={auction.endTime} />
            </div>
          </div>
        </div>
      </Link>
      <div className="button-container">
        {isAuctionEnded ? (
          <button className="bid-button" disabled>Auction Ended</button>
        ) : (
          <Link to={`/auction/${auction._id}`} className="bid-button">
            Place Bid
          </Link>
        )}
      </div>
    </div>
  );
};

export default AuctionCard;