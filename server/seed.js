const mongoose = require('mongoose');
const connectDB = require('./config/db');
const AuctionItem = require('./models/AuctionItem');
require('dotenv').config();

const seedAuctions = async () => {
  await connectDB();

  try {
    // Clear existing data
    await AuctionItem.deleteMany();
    console.log('Old auction items removed...');

    const now = new Date();
    const sampleAuctions = [
      {
        title: 'Sunrise over Ganges',
        description: 'A breathtaking digital painting...',
        imageUrl: 'https://picsum.photos/seed/ganges/800/600',
        starting_price: 500,
        auction_state: 'active',
        endTime: new Date(now.getTime() + 20 * 60 * 1000), // 20 mins from now
      },
      {
        title: 'Mumbai Local',
        description: 'A dynamic and vibrant artwork...',
        imageUrl: 'https://picsum.photos/seed/mumbai/800/600',
        starting_price: 800,
        auction_state: 'active',
        endTime: new Date(now.getTime() + 45 * 60 * 1000), // 45 mins from now
      },
      {
        title: 'Kerala Backwaters',
        description: 'Tranquil scenery from the heart of Kerala...',
        imageUrl: 'https://picsum.photos/seed/kerala/800/600',
        starting_price: 1200,
        auction_state: 'active',
        endTime: new Date(now.getTime() + 90 * 60 * 1000), // 90 mins from now
      },
    ];

    await AuctionItem.insertMany(sampleAuctions);
    console.log('✅ Sample data has been added!');
    process.exit();
  } catch (error) {
    console.error('Error with data seeding:', error);
    process.exit(1);
  }
};

seedAuctions();