// src/components/ModuleNav.jsx

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// (All styles are unchanged)
const navContainerStyle = {
  maxWidth: '500px', 
  margin: '1rem auto 2rem auto', 
  textAlign: 'center',
  fontFamily: 'inherit',
};
const dashboardButtonStyle = {
  backgroundColor: '#23318c', 
  color: '#FF6E00', 
  fontWeight: 'bold',
  fontSize: '1.2em',
  padding: '0.75rem 2rem',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  width: '100%', 
};
const linksContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap', 
  gap: '1rem',
  backgroundColor: '#f0f0f0', 
  padding: '1rem',
  borderRadius: '0 0 8px 8px', 
  marginTop: '-2px', 
};
const linkStyle = {
  backgroundColor: '#cccccc', 
  color: '#242424',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: '500',
};
const activeLinkStyle = {
  ...linkStyle,
  backgroundColor: '#FF6E00', 
  color: 'white',
};
const balanceTextStyle = {
  padding: '0.5rem 1rem',
  color: '#242424',
  fontSize: '1.1em',
  fontWeight: 'bold',
};
// --- End Styles ---

const ModuleNav = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true); 

  const renderRoleLinks = () => {
    switch (user.role) {
      // --- CREATOR ---
      case 'creator':
        return (
          <>
            <NavLink to="/dashboard/my-uploads" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
              My Uploads
            </NavLink>
            <NavLink to="/dashboard/upload-new" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
              Create New Art
            </NavLink>
            <NavLink to="/dashboard/shipping-queue" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
              Shipping Queue
            </NavLink>
            <span style={balanceTextStyle}>
              Total Payouts: ₹{user.wallet_balance || 0}
            </span>
          </>
        );
      // --- BIDDER ---
      case 'bidder':
        return (
          <>
            <NavLink to="/dashboard/my-winnings" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
              My Winnings
            </NavLink>
            <NavLink to="/dashboard/wallet" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
              My Wallet (₹{user.wallet_balance || 0})
            </NavLink>
            {/* ✅ ADD "BECOME A CREATOR" LINK */}
            <NavLink to="/dashboard/become-creator" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
              Become a Creator
            </NavLink>
          </>
        );
      // --- ADMIN ---
      case 'admin':
        return (
          <>
            <NavLink to="/dashboard/admin-panel" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
              Admin Panel
            </NavLink>
            <NavLink to="/dashboard/shipping-queue" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>
              Shipping Queue
            </NavLink>
            <span style={balanceTextStyle}>
              Platform Earnings: ₹{user.wallet_balance || 0}
            </span>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={navContainerStyle}>
      <button 
        style={dashboardButtonStyle} 
        onClick={() => setIsOpen(!isOpen)}
      >
        My Dashboard {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div style={linksContainerStyle}>
          {renderRoleLinks()}
        </div>
      )}
    </div>
  );
};

export default ModuleNav;