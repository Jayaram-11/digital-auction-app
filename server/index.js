// auction-app/server/index.js

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const auctionRoutes = require('./routes/auctionRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { initScheduler } = require('./utils/auctionScheduler');
const orderRoutes = require('./routes/orderRoutes');

connectDB();

const app = express();

// ✅ --- THIS IS THE FIX ---
// 1. Create a "whitelist" of allowed URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174'
];

// 2. Read the FRONTEND_URL string from Render
const renderOrigin = process.env.FRONTEND_URL;
if (renderOrigin) {
  // 3. If it exists, split it by the comma and add to our list
  const urls = renderOrigin.split(',');
  urls.forEach(url => allowedOrigins.push(url.trim()));
}

// 4. Give the *full list* to CORS
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions)); 
// ✅ --- END THE FIX ---

app.use(express.json());

const server = http.createServer(app);

// ✅ We also need to fix the Socket.IO CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Use the same list
    methods: ['GET', 'POST']
  }
});
// ✅ --- END THE FIX ---

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Use routes
app.use('/api/auctions', auctionRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on('joinAuction', (auctionId) => {
    socket.join(auctionId);
    console.log(`User ${socket.id} joined room ${auctionId}`);
  });
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  initScheduler(io); 
});