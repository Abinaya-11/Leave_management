const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getStudentLeaves,
    getAllLeaves,
    updateLeaveStatus,
    getAcademicCalendar,
    getPublicLeaveDetails,
    parentApproveLeave,
    parentDecisionByToken,
    verifyParentOtpByMentor
} = require('../controllers/leaveController');
const { getLeavePattern, getAttendanceSummary } = require('../controllers/analyticsController');

const { protect } = require('../middleware/authMiddleware');

// Define routes
router.post('/apply', protect, applyLeave);
router.get('/student-history', protect, getStudentLeaves);
router.get('/student/:id', protect, getStudentLeaves);
router.get('/all', protect, getAllLeaves);
router.get('/academic-calendar', protect, getAcademicCalendar);
router.get('/attendance-summary', protect, getAttendanceSummary);
router.get('/leave-pattern', protect, getLeavePattern);
router.put('/:id', protect, updateLeaveStatus);

// Public Parent Routes
router.get('/public/:id', getPublicLeaveDetails);
router.post('/public/:id/parent-decision', parentApproveLeave);
router.get('/public/:id/parent-decision-token', parentDecisionByToken);

// Mentor Verification Route
router.post('/mentor/verify-parent-otp', protect, verifyParentOtpByMentor);

module.exports = router;
