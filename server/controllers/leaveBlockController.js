const User = require('../models/User');

// @desc    Get blocked students based on role
// @route   GET /api/leave-block/students
// @access  Private (Admin, Faculty)
exports.getBlockedStudents = async (req, res) => {
    try {
        const { search, department, year } = req.query;
        let query = { role: 'student', isLeaveBlocked: true };

        // Role-based visibility
        if (req.user.role !== 'admin') {
            const facultyId = req.user._id;
            // Mentor or Warden can only see their assigned students
            query.$or = [
                { mentor: facultyId },
                { warden: facultyId }
            ];
        }

        // Apply filters
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (department) {
            query.department = department;
        }
        if (year) {
            query.year = year;
        }

        const students = await User.find(query)
            .select('-password')
            .populate('mentor', 'name email')
            .populate('warden', 'name email')
            .sort({ blockedDate: -1 });

        res.json({ success: true, count: students.length, data: students });
    } catch (err) {
        console.error('Error fetching blocked students:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Unblock a student
// @route   PUT /api/leave-block/unblock/:studentId
// @access  Private (Admin, Mentor, Warden)
exports.unblockStudent = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const student = await User.findById(studentId);

        if (!student || student.role !== 'student') {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        if (!student.isLeaveBlocked) {
            return res.status(400).json({ success: false, message: 'Student is not currently blocked.' });
        }

        // Role validation
        if (req.user.role !== 'admin') {
            const facultyId = req.user._id.toString();
            const mentorId = student.mentor ? student.mentor.toString() : null;
            const wardenId = student.warden ? student.warden.toString() : null;

            if (facultyId !== mentorId && facultyId !== wardenId) {
                return res.status(403).json({ success: false, message: 'Not authorized to unblock this student.' });
            }
        }

        // Unblock
        student.isLeaveBlocked = false;
        student.leaveBlockedReason = '';
        student.unblockedBy = req.user.name;
        
        await student.save();

        res.json({ success: true, message: `Successfully unblocked ${student.name}.` });
    } catch (err) {
        console.error('Error unblocking student:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
