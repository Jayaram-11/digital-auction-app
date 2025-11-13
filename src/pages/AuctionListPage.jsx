// src/pages/AuctionListPage.jsx

import React from 'react';
import AuctionCard from '../components/AuctionCard';

// The component still receives all 'auctions' as a prop
const AuctionListPage = ({ auctions, loading }) => {

  // ✅ --- NEW LOGIC --- ✅
  // We filter the list *before* rendering, to only show active ones
  const activeAuctions = auctions.filter(auction => auction.auction_state === 'active');
  // ✅ --- END NEW LOGIC --- ✅

  if (loading) {
    return <div>Loading auctions...</div>;
  }

  return (
    <div className="auction-list-container">
      <h2>Live Auctions</h2>
      <div className="auction-grid">
        {/* We now map over the *filtered* list */}
        {activeAuctions.length > 0 ? (
          activeAuctions.map((auction) => (
            <AuctionCard key={auction._id} auction={auction} />
          ))
        ) : (
          <p>There are no active auctions at the moment. Please check back later!</p>
        )}
      </div>
    </div>
  );
};
export default AuctionListPage;