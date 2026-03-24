const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateParentDetails, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/update-parent-details', protect, updateParentDetails);
router.put('/profile', protect, updateProfile);

module.exports = router;
