// server/models/AuctionItem.js

const mongoose = require('mongoose');

const auctionItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    artistName: { 
      type: String,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    starting_price: {
      type: Number,
      required: true,
    },
    currentBid: {
      type: Number,
      default: function () {
        return this.starting_price;
      },
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
    },
    highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    auction_state: {
      type: String,
      enum: ['pending_approval', 'active', 'sold', 'unsold', 'rejected'],
      default: 'pending_approval',
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: String,
      required: true,
      enum: ['10m', '30m', '1h'],
    },
    
    // ✅ --- ADD THESE NEW FIELDS --- ✅
    commissionAmount: {
      type: Number,
    },
    creatorPayout: {
      type: Number,
    },
    // ✅ --- END NEW FIELDS --- ✅
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AuctionItem', auctionItemSchema);