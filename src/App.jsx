// src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

// Core Components
import Header from './components/Header';
import ModuleNav from './components/ModuleNav';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectIfAuth from './components/RedirectIfAuth'; // ✅ Make sure this import exists
import { useAuth } from './context/AuthContext';

// Main Pages
import AuctionListPage from './pages/AuctionListPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WalletPage from './pages/WalletPage';
import SsoAuthPage from './pages/SsoAuthPage';

// Dashboard Pages
import DashboardPage from './pages/DashboardPage';
import DashboardIndex from './pages/dashboard/DashboardIndex';
import AdminPage from './pages/AdminPage';
import UploadPage from './pages/UploadPage';
import MyUploadsPage from './pages/dashboard/MyUploadsPage';
import MyWinningsPage from './pages/dashboard/MyWinningsPage';
import SubmitShippingPage from './pages/dashboard/SubmitShippingPage';
import ShippingQueuePage from './pages/dashboard/ShippingQueuePage';
import BecomeCreatorPage from './pages/dashboard/BecomeCreatorPage'; // ✅ NEW Import

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const socket = io(API_URL);

function App() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, updateWalletBalance } = useAuth();

  // ✅ Fetch auctions
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/auctions`);
        setAuctions(response.data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  // ✅ Socket event listeners
  useEffect(() => {
    socket.on('bidUpdate', (updatedAuction) => {
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) =>
          auction._id === updatedAuction._id ? updatedAuction : auction
        )
      );
    });

    socket.on('auctionApproved', (newAuction) => {
      setAuctions((prevAuctions) => [...prevAuctions, newAuction]);
    });

    socket.on('auctionEnded', (finishedAuction) => {
      console.log('Auction ended event received:', finishedAuction);
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) =>
          auction._id === finishedAuction._id ? finishedAuction : auction
        )
      );

      if (user && finishedAuction.winner && user._id === finishedAuction.winner._id) {
        console.log('I am the winner! Updating my wallet.');
        const newBalance = user.wallet_balance - finishedAuction.currentBid;
        updateWalletBalance(newBalance);
      }
    });

    return () => {
      socket.off('bidUpdate');
      socket.off('auctionApproved');
      socket.off('auctionEnded');
    };
  }, [user, updateWalletBalance]);

  return (
    <div className="App">
      <Header />
      {user && <ModuleNav />}

      <main>
        <Routes>
          {/* --- Public Routes --- */}
          <Route
            path="/"
            element={<AuctionListPage auctions={auctions} loading={loading} />}
          />
          <Route
            path="/auction/:id"
            element={<AuctionDetailPage auctions={auctions} socket={socket} />}
          />

          {/* --- Auth Routes (Redirect if logged in) --- */}
          <Route
            path="/login"
            element={
              <RedirectIfAuth>
                <LoginPage />
              </RedirectIfAuth>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfAuth>
                <RegisterPage />
              </RedirectIfAuth>
            }
          />
          <Route path="/auth/sso" element={<SsoAuthPage />} />

          {/* --- Dashboard Routes --- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['bidder', 'creator', 'admin']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardIndex />} />

            <Route
              path="admin-panel"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="upload-new"
              element={
                <ProtectedRoute roles={['creator']}>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-uploads"
              element={
                <ProtectedRoute roles={['creator']}>
                  <MyUploadsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="wallet"
              element={
                <ProtectedRoute roles={['bidder']}>
                  <WalletPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-winnings"
              element={
                <ProtectedRoute roles={['bidder']}>
                  <MyWinningsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="submit-shipping/:orderId"
              element={
                <ProtectedRoute roles={['bidder']}>
                  <SubmitShippingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="shipping-queue"
              element={
                <ProtectedRoute roles={['admin', 'creator']}>
                  <ShippingQueuePage />
                </ProtectedRoute>
              }
            />

            {/* ✅ NEW: Become a Creator Route */}
            <Route
              path="become-creator"
              element={
                <ProtectedRoute roles={['bidder']}>
                  <BecomeCreatorPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
