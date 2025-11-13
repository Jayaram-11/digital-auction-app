// src/components/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ✅ Change this to your main Indicart site’s URL
const INDICART_MAIN_SITE_URL = 'http://localhost:5173';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" className="logo-link">
          <h1>Indicart Auctions</h1>
        </Link>

        {/* ✅ Added link to go back to main Indicart */}
        <a
          href={INDICART_MAIN_SITE_URL}
          style={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          &larr; Back to Indicart
        </a>
      </div>

      <nav>
        {user ? (
          <>
            <span>Welcome, {user.name}!</span>
            <button onClick={logout} className="nav-button">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
