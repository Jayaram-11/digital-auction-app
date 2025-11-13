// src/pages/WalletPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom'; // ✅ Added Link import

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const WalletPage = () => {
  const { user, updateWalletBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const displayPaymentModal = async () => {
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1️⃣ Create Razorpay order
      const { data: order } = await axios.post(
        `${API_URL}/api/payments/create-order`,
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // 2️⃣ Razorpay configuration
      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: 'Indicart Auctions',
        description: 'Add Tokens to Wallet',
        image: 'https://example.com/your_logo.png',
        order_id: order.id,
        handler: async (response) => {
          try {
            // 3️⃣ Verify payment
            const { data } = await axios.post(
              `${API_URL}/api/payments/verify-payment`,
              {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: Number(amount),
              },
              { headers: { Authorization: `Bearer ${user.token}` } }
            );

            updateWalletBalance(data.newBalance);
            alert('✅ Payment successful! Your wallet has been updated.');
            setAmount('');
          } catch (verifyError) {
            console.error('Payment verification failed', verifyError);
            alert('❌ Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#305CDE',
        },
      };

      // 4️⃣ Open Razorpay modal
      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', (response) => {
        alert(`❌ Payment failed: ${response.error.description}`);
        console.error('Payment Failed:', response.error);
      });
    } catch (err) {
      console.error('Order creation failed:', err);
      const errorMsg =
        err.response?.data?.error?.description ||
        err.response?.data?.message ||
        'Could not initiate payment. Please try again.';
      alert(`Error: ${errorMsg}`);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      {/* ✅ Back to Home Button */}
      <Link
        to="/"
        className="back-button"
        style={{
          marginBottom: '1rem',
          display: 'inline-block',
          color: '#305CDE',
          textDecoration: 'none',
          fontWeight: '500'
        }}
      >
        ← Back to Home
      </Link>

      <h2>My Wallet</h2>

      <div
        className="current-balance"
        style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.2em' }}
      >
        Current Balance: <strong>₹{user.wallet_balance || 0}</strong>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <label>Amount to Add (₹):</label>
        <input
          type="number"
          placeholder="e.g., 500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
        />
        <button onClick={displayPaymentModal} disabled={loading}>
          {loading ? 'Processing...' : `Add ₹${amount || 0} to Wallet`}
        </button>

        {error && (
          <p
            className="error-message"
            style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default WalletPage;
