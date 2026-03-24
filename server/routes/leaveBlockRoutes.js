const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getBlockedStudents, unblockStudent } = require('../controllers/leaveBlockController');

// All routes are protected and require admin or faculty access
router.use(protect);
router.use(authorize('admin', 'faculty', 'warden')); // Since faculty acts as mentor or warden. Note: if warden is a separate role consider adding it. Currently in User schema role is 'student', 'faculty', 'admin', 'placement_cell', 'clubs_coordinator', 'iecc'. So 'faculty' covers mentors and wardens

router.get('/students', getBlockedStudents);
router.put('/unblock/:studentId', unblockStudent);

module.exports = router;
