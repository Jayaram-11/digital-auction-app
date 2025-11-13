// server/models/Order.js

const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    auctionItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuctionItem',
      required: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    printDimensions: {
      type: String,
    },
    shippingDetails: shippingSchema,
    orderStatus: {
      type: String,
      required: true,
      enum: ['Pending Shipping Details', 'Pending Shipment', 'Shipped'],
      default: 'Pending Shipping Details',
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

module.exports = mongoose.model('Order', orderSchema);