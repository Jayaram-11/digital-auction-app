// server/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['bidder', 'creator', 'admin'],
    default: 'bidder',
  },
  wallet_balance: {
    type: Number,
    default: 0,
  },

  // ✅ --- NEW FIELDS TO MATCH INDICART ---
  mobile: {
    type: String,
  },
  upiId: {
    type: String,
  },
  bio: {
    type: String,
  },
  // ✅ --- END NEW FIELDS ---

}, {
  timestamps: true,
});

// (pre-save hook and matchPassword method are unchanged)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('User', userSchema);