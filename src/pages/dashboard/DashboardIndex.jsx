// src/pages/dashboard/DashboardIndex.jsx

import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DashboardIndex = () => {
  const { user } = useAuth();

  // ✅ --- NEW LOGIC --- ✅
  // Helper function to render the correct welcome text
  const renderWelcomeMessage = () => {
    switch (user.role) {
      case 'bidder':
        return (
          <p>Please select an option from the navigation bar above to view your wallet or see the auctions you've won.</p>
        );
      case 'creator':
        return (
          <p>Please select an option from the navigation bar above. 'My Uploads' will show you the status of all your arts, and 'Upload New Art' will let you start a new auction.</p>
        );
      case 'admin':
        return (
          <p>Select 'Admin Panel' from the navigation bar to manage pending artwork approvals.</p>
        );
      default:
        return <p>Welcome to your dashboard.</p>;
    }
  };
  // ✅ --- END NEW LOGIC --- ✅

  return (
    <div style={{ padding: '0 2rem' }}>
      <h2>Welcome to your Dashboard, {user.name}!</h2>
      
      {/* Call the new helper function */}
      {renderWelcomeMessage()}

    </div>
  );
};

export default DashboardIndex;