// server/controllers/auctionController.js

const AuctionItem = require('../models/AuctionItem');

// @desc    Fetch all active auctions
// @route   GET /api/auctions
// @access  Public
const getAuctions = async (req, res) => {
  try {
    const auctions = await AuctionItem.find({ auction_state: 'active' })
      .populate('creator', 'name');

    res.status(200).json(auctions);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Place a bid on an auction
// @route   POST /api/auctions/:id/bids
// @access  Private/Bidder
const placeBid = async (req, res) => {
  try {
    const { bidAmount } = req.body;
    const auctionId = req.params.id;
    const bidder = req.user;

    const auction = await AuctionItem.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    if (new Date() > new Date(auction.endTime)) {
      return res.status(400).json({ message: 'Auction has already ended' });
    }
    if (bidAmount <= auction.currentBid) {
      return res.status(400).json({ message: 'Bid must be higher than the current bid' });
    }
    if (bidder.wallet_balance < bidAmount) {
      return res.status(400).json({
        message: `Insufficient balance. Your max bid is ₹${bidder.wallet_balance}`
      });
    }

    auction.currentBid = bidAmount;
    auction.highestBidder = bidder._id;

    const updatedAuction = await auction.save();

    req.io.to(auctionId).emit('bidUpdate', updatedAuction);
    res.status(200).json(updatedAuction);
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new auction
// @route   POST /api/auctions
// @access  Private/Creator
const createAuction = async (req, res) => {
  try {
    const { title, description, starting_price, duration, imageUrl, artistName } = req.body;

    const auction = new AuctionItem({
      title,
      description,
      starting_price,
      imageUrl,
      artistName,
      duration, // ✅ keep duration
      creator: req.user._id,
    });

    let createdAuction = await auction.save();
    createdAuction = await createdAuction.populate('creator', 'name email');
    res.status(201).json(createdAuction);
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all auctions pending approval
// @route   GET /api/auctions/pending
// @access  Private/Admin
const getPendingAuctions = async (req, res) => {
  try {
    const auctions = await AuctionItem.find({ auction_state: 'pending_approval' })
      .populate('creator', 'name email');
    res.status(200).json(auctions);
  } catch (error) {
    console.error('Error fetching pending auctions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update an auction's status (approve/reject)
// @route   PUT /api/auctions/:id/status
// @access  Private/Admin
const updateAuctionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (status !== 'active' && status !== 'rejected') {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const auction = await AuctionItem.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    auction.auction_state = status;

    // ✅ set endTime dynamically when approved
    if (status === 'active') {
      const now = new Date();
      let endTime;

      switch (auction.duration) {
        case '10m':
          endTime = new Date(now.getTime() + 10 * 60 * 1000);
          break;
        case '30m':
          endTime = new Date(now.getTime() + 30 * 60 * 1000);
          break;
        case '1h':
          endTime = new Date(now.getTime() + 60 * 60 * 1000);
          break;
        default:
          endTime = new Date(now.getTime() + 10 * 60 * 1000);
      }

      auction.endTime = endTime;
    }

    const updatedAuction = await auction.save();

    if (status === 'active') {
      req.io.emit('auctionApproved', updatedAuction);
    }

    res.status(200).json(updatedAuction);
  } catch (error) {
    console.error('Error updating auction status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ✅ --- NEW FUNCTION 1 --- ✅
// @desc    Get all auctions uploaded by the logged-in creator
// @route   GET /api/auctions/my-uploads
// @access  Private/Creator
const getMyUploads = async (req, res) => {
  try {
    const auctions = await AuctionItem.find({ creator: req.user._id })
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(auctions);
  } catch (error) {
    console.error('Error fetching "My Uploads":', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ✅ --- NEW FUNCTION 2 --- ✅
// @desc    Get all auctions won by the logged-in bidder
// @route   GET /api/auctions/my-winnings
// @access  Private/Bidder
const getMyWinnings = async (req, res) => {
  try {
    const auctions = await AuctionItem.find({
      winner: req.user._id,
      auction_state: 'sold'
    })
      .populate('creator', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(auctions);
  } catch (error) {
    console.error('Error fetching "My Winnings":', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ✅ Export everything
module.exports = {
  getAuctions,
  placeBid,
  createAuction,
  getPendingAuctions,
  updateAuctionStatus,
  getMyUploads,    // ✅ Added
  getMyWinnings,   // ✅ Added
};
