// server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  ssoLogin,
  upgradeToCreator // ✅ Import new function
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Import protect

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/sso-login', ssoLogin);

// ✅ Add the new route
router.put('/upgrade-to-creator', protect, upgradeToCreator);

module.exports = router;