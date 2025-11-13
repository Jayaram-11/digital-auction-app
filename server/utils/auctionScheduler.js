// server/utils/auctionScheduler.js

const cron = require('node-cron');
const AuctionItem = require('../models/AuctionItem');
const User = require('../models/User');
const Order = require('../models/Order');

let ioInstance = null;

const processEndedAuctions = async () => {
  console.log('Running scheduled job: Processing ended auctions...');
  
  const now = new Date();
  
  try {
    const endedAuctions = await AuctionItem.find({
      auction_state: 'active',
      endTime: { $lte: now } 
    });

    if (endedAuctions.length === 0) {
      console.log('No ended auctions to process.');
      return;
    }

    console.log(`Found ${endedAuctions.length} ended auctions to process.`);

    const platformAdmin = await User.findOne({ role: 'admin' });
    if (!platformAdmin) {
      console.error('CRITICAL ERROR: No admin user found to collect commission. Skipping payouts.');
      return; 
    }

    for (const auction of endedAuctions) {
      // CASE 1: The auction SOLD
      if (auction.highestBidder) {
        
        const winner = await User.findById(auction.highestBidder);
        const creator = await User.findById(auction.creator);
        
        if (winner && creator && winner.wallet_balance >= auction.currentBid) {
          
          const winningBid = auction.currentBid;
          
          // ✅ --- COMMISSION LOGIC FIX --- ✅
          // Changed from 100 to 1000
          const commissionRate = winningBid > 1000 ? 0.10 : 0.08; // 10% or 8%
          // ✅ --- END COMMISSION LOGIC FIX --- ✅

          const commissionAmount = Math.round(winningBid * commissionRate);
          const creatorPayout = winningBid - commissionAmount;

          // Move the "tokens"
          winner.wallet_balance -= winningBid;
          creator.wallet_balance = (creator.wallet_balance || 0) + creatorPayout;
          platformAdmin.wallet_balance = (platformAdmin.wallet_balance || 0) + commissionAmount;
          
          await winner.save();
          await creator.save();
          await platformAdmin.save();
          
          // Stamp the "Receipts"
          auction.auction_state = 'sold';
          auction.winner = winner._id;
          auction.commissionAmount = commissionAmount;
          auction.creatorPayout = creatorPayout;
          
          console.log(`Auction ${auction._id} marked as SOLD. Winner ${winner.email} charged ₹${winningBid}.`);
          console.log(`   > Payout to ${creator.email}: ₹${creatorPayout}`);
          console.log(`   > Commission to Admin: ₹${commissionAmount}`);

          try {
            const newOrder = new Order({
              auctionItem: auction._id,
              winner: winner._id,
              creator: auction.creator,
              finalAmount: winningBid,
              orderStatus: 'Pending Shipping Details',
              commissionAmount: commissionAmount, 
              creatorPayout: creatorPayout,
            });
            await newOrder.save();
            console.log(`Order ${newOrder._id} created for auction ${auction._id}.`);
          } catch (orderError) {
            console.error(`Failed to create order for auction ${auction._id}:`, orderError);
          }
        } else {
          auction.auction_state = 'unsold';
          console.warn(`Auction ${auction._id} processing failed. Winner/Creator not found or insufficient funds. Marked as unsold.`);
        }
      
      } 
      // CASE 2: The auction was UNSOLD
      else {
        auction.auction_state = 'unsold';
        console.log(`Auction ${auction._id} had no bids. Marked as UNSOLD.`);
      }

      await auction.save();

      if (ioInstance) {
        try {
          const finishedAuction = await AuctionItem.findById(auction._id)
            .populate('winner', 'name') 
            .populate('creator', 'name'); 

          ioInstance.emit('auctionEnded', finishedAuction);
          console.log(`Broadcasted auctionEnded event for ${auction._id}`);
        } catch (populateError) {
          console.error('Error populating and broadcasting auction:', populateError);
        }
      }
    }
    
  } catch (error) {
    console.error('Error processing ended auctions:', error);
  }
};

const initScheduler = (io) => {
  ioInstance = io;
  cron.schedule('* * * * *', processEndedAuctions);
  console.log('Auction scheduler started. Will check for ended auctions every minute.');
};

module.exports = { initScheduler };