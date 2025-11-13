// src/data/mockAuctions.js (Updated)

const now = new Date();

export const mockAuctions = [
  {
    id: 1,
    title: 'Sunrise over Ganges',
    creator: 'Ravi Verma',
    description: 'A breathtaking digital painting capturing the serene morning light over the holy river. Created using Procreate on iPad.',
    imageUrl: 'https://picsum.photos/seed/ganges/800/600',
    starting_price: 500,
    currentBid: 750,
    endTime: new Date(now.getTime() + 10 * 60 * 1000),
  },
  {
    id: 2,
    title: 'Mumbai Local',
    creator: 'Priya Sharma',
    description: 'A dynamic and vibrant artwork depicting the controlled chaos of a Mumbai local train. Captures the spirit of the city.',
    imageUrl: 'https://picsum.photos/seed/mumbai/800/600',
    starting_price: 800,
    currentBid: 800,
    endTime: new Date(now.getTime() + 35 * 60 * 1000),
  },
  {
    id: 3,
    title: 'Kerala Backwaters',
    creator: 'Anand Kumar',
    description: 'Tranquil scenery from the heart of Kerala, showing a traditional houseboat amidst lush greenery. Hand-drawn and digitally colored.',
    imageUrl: 'https://picsum.photos/seed/kerala/800/600',
    starting_price: 1200,
    currentBid: 1500,
    endTime: new Date(now.getTime() + 65 * 60 * 1000),
  },
];