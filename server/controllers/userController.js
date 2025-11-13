// server/controllers/userController.js

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// -------------------- REGISTER USER --------------------
// ✅ We no longer accept 'role' from the frontend
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // ✅ 'role' is removed. It will now use the 'bidder' default
  const user = await User.create({ name, email, password });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // This will be 'bidder'
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// -------------------- LOGIN USER --------------------
// (This function is correct and unchanged)
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await user.matchPassword(password);
    if (isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet_balance: user.wallet_balance,
        token: generateToken(user._id),
      });
    } else if (user.password === 'sso_user_placeholder_password') {
      console.log(`User ${email} is an SSO user. Upgrading password...`);
      user.password = password; 
      await user.save();
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet_balance: user.wallet_balance,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// -------------------- SSO LOGIN --------------------
// ✅ This is now "smarter" and syncs payout info
const ssoLogin = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // We assume the Indicart token has these fields
    const { id, fullName, email, role: indicartRole, mobile, upiId, bio } = decoded;

    if (!id || !fullName || !email) {
      return res.status(400).json({
        message: 'SSO Failed: Token is incomplete. Main site must provide id, fullName, and email.',
      });
    }

    let auctionRole = 'bidder';
    if (indicartRole === 'Seller') auctionRole = 'creator';
    if (indicartRole === 'Admin') auctionRole = 'admin';

    const user = await User.findOneAndUpdate(
      { _id: id }, // Find by Indicart ID
      {
        $set: {
          name: fullName,
          email: email,
          role: auctionRole,
          mobile: mobile, // ✅ Sync payout info
          upiId: upiId,   // ✅ Sync payout info
          bio: bio,       // ✅ Sync payout info
        },
        $setOnInsert: {
          _id: id,
          password: 'sso_user_placeholder_password',
          wallet_balance: 0,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      wallet_balance: user.wallet_balance,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('SSO Login Failed:', error);
    res.status(401).json({
      message: 'SSO Login Failed. A database error occurred.',
    });
  }
};

// ✅ --- NEW FUNCTION ---
// @desc    Upgrade a bidder to a creator
// @route   PUT /api/users/upgrade-to-creator
// @access  Private
const upgradeToCreator = async (req, res) => {
  try {
    const { mobile, upiId, bio } = req.body;

    if (!mobile || !upiId || !bio) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.mobile = mobile;
    user.upiId = upiId;
    user.bio = bio;
    user.role = 'creator'; // ✅ Upgrade the user's role

    const updatedUser = await user.save();

    // Send back the full new user object with a new token
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      wallet_balance: updatedUser.wallet_balance,
      token: generateToken(updatedUser._id),
    });

  } catch (error) {
    console.error('Creator upgrade failed:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
// ✅ --- END NEW FUNCTION ---

// -------------------- EXPORTS --------------------
module.exports = {
  registerUser,
  loginUser,
  ssoLogin,
  upgradeToCreator, // ✅ Export the new function
};