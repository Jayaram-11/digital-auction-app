// server/controllers/paymentController.js

const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// ✅ Debug logs for verification
console.log('--- BACKEND SERVER KEYS ---');
console.log('KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Loaded' : '!!! NOT LOADED !!!');
console.log('---------------------------');

/**
 * @desc    Create a new Razorpay order
 * @route   POST /api/payments/create-order
 * @access  Private
 */
const createOrder = async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Number(req.body.amount) * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).send('Error creating Razorpay order');
    }

    res.status(200).json(order);
  } catch (error) {
    // ✅ NEW: Send Razorpay’s specific error details for debugging
    console.error('Error in createOrder:', error);
    res.status(500).json({
      message: 'Razorpay order creation failed',
      error: error.error || error.message, // Expose exact cause
    });
  }
};

/**
 * @desc    Verify a payment and update wallet
 * @route   POST /api/payments/verify-payment
 * @access  Private
 */
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, amount } = req.body;

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${orderId}|${paymentId}`);
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      return res.status(400).json({ message: 'Payment verification failed: Invalid signature' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.wallet_balance = (user.wallet_balance || 0) + Number(amount);
    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Payment verified successfully',
      newBalance: updatedUser.wallet_balance,
    });
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    res.status(500).send(error);
  }
};

module.exports = { createOrder, verifyPayment };
