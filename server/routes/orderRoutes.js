// server/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const { 
  getMyWinnings,
  submitShippingDetails,
  getShippingQueue
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// --- Bidder Routes ---
router.get('/my-winnings', protect, getMyWinnings);
router.put('/:id/submit-details', protect, submitShippingDetails);

// --- Admin/Creator Routes ---
router.get('/shipping-queue', protect, getShippingQueue);


module.exports = router;