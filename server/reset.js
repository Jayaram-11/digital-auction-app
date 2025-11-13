// server/reset.js
// This script will reset all user wallets to 0
// and delete all auction-related documents.

require('dotenv').config(); // Make sure it can read the .env file
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const AuctionItem = require('./models/AuctionItem');
const Order = require('./models/Order');
const Bid = require('./models/Bid'); // We'll clear this too, just in case

const resetDatabase = async () => {
  try {
    await connectDB();

    console.log('Resetting all user wallet balances to 0...');
    // This is the key: update ALL users and set their balance to 0
    const updateResult = await User.updateMany(
      {}, // An empty filter means "all users"
      { $set: { wallet_balance: 0 } }
    );
    console.log(`Updated ${updateResult.modifiedCount} user wallets.`);

    console.log('Deleting all auction items...');
    const auctionResult = await AuctionItem.deleteMany({});
    console.log(`Deleted ${auctionResult.deletedCount} auction items.`);

    console.log('Deleting all orders...');
    const orderResult = await Order.deleteMany({});
    console.log(`Deleted ${orderResult.deletedCount} orders.`);

    console.log('Deleting all bids...');
    const bidResult = await Bid.deleteMany({});
    console.log(`Deleted ${bidResult.deletedCount} bids.`);

    console.log('\n✅ --- DATABASE HAS BEEN RESET --- ✅');
    console.log('All wallets are at ₹0 and all auctions are cleared.');
    
    process.exit();

  } catch (error) {
    console.error('Error during database reset:', error);
    process.exit(1);
  }
};

// Run the script
resetDatabase();