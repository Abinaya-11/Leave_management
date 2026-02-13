const Leave = require('../models/Leave');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Apply for a leave
// @route   POST /api/leaves/apply
// @access  Private (Student)
const applyLeave = async (req, res) => {
    try {
        const { startDate, endDate, startTime, endTime, duration, period, leaveType, reason } = req.body;

        // Ensure user is attached (middleware will do this later)
        if (!req.body.studentId) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        const leave = await Leave.create({
            studentId: req.body.studentId,
            startDate,
            endDate,
            startTime,
            endTime,
            duration,
            period,
            leaveType,
            reason
        });

        // --- Notification Logic: Notify Faculty ---
        const student = await User.findById(req.body.studentId);
        const facultyMembers = await User.find({ role: 'faculty' });

        if (facultyMembers.length > 0) {
            const notifications = facultyMembers.map(faculty => ({
                recipient: faculty._id,
                sender: req.body.studentId,
                message: `New leave request from ${student ? student.name : 'Student'}`,
                type: 'LEAVE_REQUEST',
                leaveId: leave._id
            }));
            await Notification.insertMany(notifications);
        }
        // ------------------------------------------

        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get leave history for a specific student
// @route   GET /api/leaves/student/:id
// @access  Private (Student)
const getStudentLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ studentId: req.params.id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all leaves (for Faculty dashboard)
// @route   GET /api/leaves/all
// @access  Private (Faculty)
const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find().populate('studentId', 'name email department').sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or Reject leave
// @route   PUT /api/leaves/:id
// @access  Private (Faculty)
const updateLeaveStatus = async (req, res) => {
    try {
        const { status, adminRemark } = req.body;

        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        leave.status = status || leave.status;
        leave.adminRemark = adminRemark || leave.adminRemark;

        const updatedLeave = await leave.save();

        // --- Notification Logic: Notify Student ---
        // We need the admin ID who updated this. Assuming passed in body for now or we can use a system sender if not available.
        // For better flow, we should pass adminId in body or from req.user
        const senderId = req.body.adminId || leave.studentId; // Fallback to self if no adminId (should be fixed with auth)

        await Notification.create({
            recipient: leave.studentId,
            sender: senderId,
            message: `Your leave request has been ${updatedLeave.status.toLowerCase()}`,
            type: 'LEAVE_STATUS_UPDATE',
            leaveId: leave._id
        });
        // ------------------------------------------

        res.json(updatedLeave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    applyLeave,
    getStudentLeaves,
    getAllLeaves,
    updateLeaveStatus
};
