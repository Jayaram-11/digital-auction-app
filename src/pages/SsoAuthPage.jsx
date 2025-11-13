// src/pages/SsoAuthPage.jsx

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// ❌ We don't need jwt-decode here anymore, the backend handles it all
// import { jwtDecode } from 'jwt-decode';

const SsoAuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { ssoLogin } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      const loginUserWithToken = async () => {
        try {
          // 1. Call the login function, which now returns the user
          const user = await ssoLogin(token);
          
          // ✅ --- ROLE-BASED REDIRECT --- ✅
          // 2. Check the user's role
          if (user.role === 'bidder') {
            // Bidders go to the homepage
            navigate('/');
          } else {
            // Admins and Creators go to their dashboard
            navigate('/dashboard'); 
          }
          // ✅ --- END ROLE-BASED REDIRECT --- ✅

        } catch (err) {
          setError(err.message || 'SSO Login Failed. Please try logging in manually.');
          setTimeout(() => navigate('/login'), 3000);
        }
      };
      loginUserWithToken();
    } else {
      setError('No SSO token provided. Redirecting to login.');
      setTimeout(() => navigate('/login'), 3000);
    }
    // We add 'navigate' and 'ssoLogin' to the dependency array
  }, [searchParams, navigate, ssoLogin]);

  // (The return/render part is unchanged)
  return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      {error ? (
        <>
          <h2>SSO Login Failed</h2>
          <p style={{ color: 'red' }}>{error}</p>
        </>
      ) : (
        <>
          <h2>Logging you in...</h2>
          <p>Please wait while we securely transfer your session.</p>
        </>
      )}
    </div>
  );
};

export default SsoAuthPage;