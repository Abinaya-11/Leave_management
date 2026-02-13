const User = require('../models/User');
const Leave = require('../models/Leave');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'student' });
        const facultyCount = await User.countDocuments({ role: 'faculty' });
        const leaveCount = await Leave.countDocuments();

        res.json({
            students: studentCount,
            faculty: facultyCount,
            leaves: leaveCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (students and faculty)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        const faculty = await User.find({ role: 'faculty' }).select('-password');

        // We also need to add leave counts for students and approval counts for faculty
        // This can be done with aggregation or separate queries. For simplicity, we'll do separate queries or just send the users.
        // Actually, the requirement asks for "Leave Count" and "Total Leaves Approved".

        const studentsWithLeaves = await Promise.all(students.map(async (student) => {
            const leaveCount = await Leave.countDocuments({ studentId: student._id });
            return { ...student._doc, leaveCount };
        }));

        const facultyWithApprovals = await Promise.all(faculty.map(async (f) => {
            const approvedCount = await Leave.countDocuments({ approvedBy: f._id, status: 'Approved' });
            return { ...f._doc, approvedCount };
        }));

        res.json({
            students: studentsWithLeaves,
            faculty: facultyWithApprovals
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle block status of a user
// @route   PATCH /api/admin/users/:id/block
// @access  Private/Admin
const toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: user.isBlocked });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get analytics data for charts
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
    try {
        const leaves = await Leave.find().populate('studentId', 'department');

        // 1. Leaves by Department
        const deptMap = {};
        leaves.forEach(l => {
            const dept = l.studentId?.department || 'Unknown';
            deptMap[dept] = (deptMap[dept] || 0) + 1;
        });
        const leavesByDepartment = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

        // 2. Leaves by Status
        const statusMap = { Approved: 0, Pending: 0, Rejected: 0 };
        leaves.forEach(l => {
            if (statusMap.hasOwnProperty(l.status)) {
                statusMap[l.status]++;
            }
        });
        const leavesByStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

        // 3. Monthly Leave Trends
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyMap = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

        leaves.forEach(l => {
            const date = new Date(l.createdAt);
            const month = months[date.getMonth()];
            monthlyMap[month]++;
        });
        const monthlyTrends = months.map(name => ({ name, value: monthlyMap[name] }));

        res.json({
            leavesByDepartment,
            leavesByStatus,
            monthlyTrends
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats,
    getUsers,
    toggleBlockUser,
    deleteUser,
    getAnalytics
};
