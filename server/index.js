// server/index.js

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

// ✅ --- THE FIX IS HERE --- ✅
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', // Add this line
    process.env.FRONTEND_URL
  ],
  methods: ['GET', 'POST', 'PUT']
};
app.use(cors(corsOptions));
// ✅ --- END THE FIX --- ✅

app.use(express.json());

const server = http.createServer(app);

// ✅ --- AND THE FIX IS HERE --- ✅
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174', // Add this line
      process.env.FRONTEND_URL
    ],
    methods: ['GET', 'POST']
  }
});
// ✅ --- END THE FIX --- ✅

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