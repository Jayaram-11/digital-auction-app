// server/routes/auctionRoutes.js

const express = require('express');
const router = express.Router();
const { 
  getAuctions, 
  placeBid, 
  createAuction, 
  getPendingAuctions, 
  updateAuctionStatus,
  getMyUploads
} = require('../controllers/auctionController');
// ✅ We are only importing these three
const { protect, isCreator, isAdmin } = require('../middleware/authMiddleware'); 

// --- Public Route ---
router.get('/', getAuctions);

// --- Creator Routes ---
router.post('/', protect, isCreator, createAuction);
router.get('/my-uploads', protect, isCreator, getMyUploads); 

// --- Bidder Routes ---
// ✅ Removed the 'isBidder' middleware
router.post('/:id/bids', protect, placeBid); 

// --- Admin Routes ---
router.get('/pending', protect, isAdmin, getPendingAuctions);
router.put('/:id/status', protect, isAdmin, updateAuctionStatus);

module.exports = router;