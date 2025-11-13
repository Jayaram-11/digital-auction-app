// server/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ This is the original, simple version
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// ✅ Reverted to only check for 'creator'
const isCreator = (req, res, next) => {
  if (req.user && req.user.role === 'creator') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a creator' });
  }
};

// ✅ Reverted to only check for 'admin'
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(401).json({ message: 'Not authorized as an admin' });
    }
  };

module.exports = { protect, isCreator, isAdmin };