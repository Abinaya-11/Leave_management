const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getStudentLeaves,
    getAllLeaves,
    updateLeaveStatus
} = require('../controllers/leaveController');

// Define routes
router.post('/apply', applyLeave);
router.get('/student/:id', getStudentLeaves);
router.get('/all', getAllLeaves);
router.put('/:id', updateLeaveStatus);

module.exports = router;
