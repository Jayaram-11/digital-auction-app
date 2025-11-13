// server/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Create a new Razorpay order
// @route   POST /api/payments/create-order
// @access  Private (User must be logged in)
router.post('/create-order', protect, createOrder);

// @desc    Verify a payment and update wallet
// @route   POST /api/payments/verify-payment
// @access  Private (User must be logged in)
router.post('/verify-payment', protect, verifyPayment);

module.exports = router;