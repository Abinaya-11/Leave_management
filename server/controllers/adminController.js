const User = require('../models/User');
const Leave = require('../models/Leave');
const DeptMentor = require('../models/DeptMentor');
const HostelWarden = require('../models/HostelWarden');
const Department = require('../models/Department');
const GPSchedule = require('../models/GPSchedule');
const AcademicCalendar = require('../models/AcademicCalendar');

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
        const students = await User.find({ role: 'student' })
            .select('-password')
            .populate('mentor', 'name')
            .populate('warden', 'name')
            .lean();

        const studentsWithLeaves = await Promise.all(students.map(async (student) => {
            const leaveCount = await Leave.countDocuments({ studentId: student._id });

            // Fallback mapping for existing users
            let type = student.student_type;
            if (!type && student.studentType) {
                const legacy = student.studentType.toUpperCase();
                if (legacy === 'HOSTELLER') type = 'Hosteller';
                else if (legacy === 'DAYSCHOLAR') type = 'Dayscholar';
                else type = student.studentType;
            }

            if (!type) type = 'Dayscholar';

            return {
                ...student,
                student_type: type,
                register_no: student.register_no || student.registerNo,
                leaveCount
            };
        }));

        const faculty = await User.find({ role: 'faculty' }).select('-password').lean();

        const facultyWithDetails = faculty.map(f => ({
            ...f,
            faculty_id: f.faculty_id || 'N/A',
            department: f.department || 'N/A'
        }));

        res.json({
            students: studentsWithLeaves,
            faculty: facultyWithDetails
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

// @desc    Assign faculty to a student
// @route   PATCH /api/admin/users/:id/assign
// @access  Private/Admin
const assignFaculty = async (req, res) => {
    try {
        const { mentorId, wardenId, student_type } = req.body;
        const student = await User.findById(req.params.id);

        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student_type) {
            student.student_type = student_type;
        }

        const currentType = student.student_type || student.studentType || 'Dayscholar';
        const normalizedType = currentType.toLowerCase();

        if (normalizedType === 'hosteller') {
            if (!mentorId) return res.status(400).json({ message: 'Mentor is required for Hosteller' });
            if (!wardenId) return res.status(400).json({ message: 'Warden is required for Hosteller' });
            student.mentor = mentorId;
            student.warden = wardenId;
        } else {
            if (!mentorId) return res.status(400).json({ message: 'Mentor is required' });
            student.mentor = mentorId;
            student.warden = undefined;
            if (!student.student_type) student.student_type = 'Dayscholar';
        }

        await student.save();
        res.json({ message: 'Faculty assigned successfully', student });
    } catch (error) {
        console.error('Assignment error:', error);
        res.status(500).json({ message: 'Assignment failed: ' + error.message });
    }
};

// @desc    Get all mappings (Dept Mentors and Hostel Wardens)
// @route   GET /api/admin/mappings
// @access  Private/Admin
const getMappings = async (req, res) => {
    try {
        const deptMentors = await DeptMentor.find().populate('faculty', 'name email');
        const hostelWardens = await HostelWarden.find().populate('faculty', 'name email');
        res.json({ deptMentors, hostelWardens });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update or create Department Mentor mapping
// @route   POST /api/admin/dept-mentor
// @access  Private/Admin
const saveDeptMentor = async (req, res) => {
    try {
        const { department, faculty_id } = req.body;

        if (!department || !faculty_id) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existing = await DeptMentor.findOne({ department });

        if (existing) {
            existing.faculty = faculty_id;
            await existing.save();
        } else {
            await DeptMentor.create({
                department,
                faculty: faculty_id
            });
        }

        res.status(200).json({ message: "Department mentor mapping saved successfully" });

        // Step 9: Immediate bulk update for existing students
        try {
            const result = await User.updateMany(
                { role: 'student', department: department },
                { mentor: faculty_id }
            );
            console.log(`Auto-updated ${result.modifiedCount} students for department ${department}`);
        } catch (bulkError) {
            console.error("Bulk update error (Dept):", bulkError);
        }
    } catch (error) {
        console.error("Dept Mentor Mapping Error:", error);
        res.status(500).json({
            message: "Failed to update mapping",
            error: error.message
        });
    }
};

// @desc    Update or create Hostel Warden mapping
// @route   POST /api/admin/hostel-warden
// @access  Private/Admin
const saveHostelWarden = async (req, res) => {
    try {
        const { hostel_name, floor, faculty_id } = req.body;

        if (!hostel_name || !floor || !faculty_id) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existing = await HostelWarden.findOne({ hostel_name, floor });

        if (existing) {
            existing.faculty = faculty_id;
            await existing.save();
        } else {
            await HostelWarden.create({
                hostel_name,
                floor,
                faculty: faculty_id
            });
        }

        res.status(200).json({ message: "Hostel warden mapping saved successfully" });

        // Step 9: Immediate bulk update for existing students
        try {
            const result = await User.updateMany(
                { 
                    role: 'student', 
                    student_type: 'Hosteller', // Match by student_type as well
                    hostel_name: hostel_name, 
                    floor: floor 
                },
                { warden: faculty_id }
            );
            console.log(`Auto-updated ${result.modifiedCount} students for ${hostel_name} - ${floor}`);
        } catch (bulkError) {
            console.error("Bulk update error (Warden):", bulkError);
        }
    } catch (error) {
        console.error("Hostel Mapping Error:", error);
        res.status(500).json({
            message: "Failed to update mapping",
            error: error.message
        });
    }
};

// @desc    Delete mapping
// @route   DELETE /api/admin/mappings/:type/:id
// @access  Private/Admin
const deleteMapping = async (req, res) => {
    try {
        const { type, id } = req.params;
        if (type === 'dept') {
            await DeptMentor.findByIdAndDelete(id);
        } else if (type === 'warden') {
            await HostelWarden.findByIdAndDelete(id);
        } else {
            return res.status(400).json({ message: 'Invalid mapping type' });
        }
        res.json({ message: 'Mapping deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Recalculate all student assignments based on current mapping rules
// @route   POST /api/admin/recalculate-assignments
// @access  Private/Admin
const recalculateAssignments = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' });
        const deptMentors = await DeptMentor.find();
        const hostelWardens = await HostelWarden.find();

        let updatedCount = 0;

        for (const student of students) {
            let changed = false;

            if (student.department) {
                const mapping = deptMentors.find(m => m.department === student.department);
                if (mapping && (!student.mentor || student.mentor.toString() !== mapping.faculty.toString())) {
                    student.mentor = mapping.faculty;
                    changed = true;
                }
            }

            if (student.student_type?.toUpperCase() === 'HOSTELLER' && student.hostel_name && student.floor) {
                const mapping = hostelWardens.find(w =>
                    w.hostel_name === student.hostel_name &&
                    w.floor === student.floor
                );
                if (mapping && (!student.warden || student.warden.toString() !== mapping.faculty.toString())) {
                    student.warden = mapping.faculty;
                    changed = true;
                }
            } else if (student.student_type?.toUpperCase() === 'DAYSCHOLAR') {
                if (student.warden) {
                    student.warden = undefined;
                    changed = true;
                }
            }

            if (changed) {
                await student.save();
                updatedCount++;
            }
        }

        res.json({ message: `Successfully updated ${updatedCount} student assignments.`, updatedCount });
    } catch (error) {
        console.error("Recalculate Error:", error);
        res.status(500).json({ message: "Failed to recalculate assignments", error: error.message });
    }
};

// @desc    Get unique departments from registered students
// @route   GET /api/admin/departments
// @access  Private/Admin
const getUniqueDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ dept_name: 1 }).lean();
        res.json(departments.map(d => d.dept_name));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get unique hostels from registered students
// @route   GET /api/admin/hostels
// @access  Private/Admin
const getUniqueHostels = async (req, res) => {
    try {
        const hostels = await User.distinct('hostel_name', { role: 'student', hostel_name: { $ne: null } });
        res.json(hostels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- GP Schedule CRUD ---
const getGPSchedules = async (req, res) => {
    try {
        const schedules = await GPSchedule.find().sort({ start_date: -1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createGPSchedule = async (req, res) => {
    try {
        const { start_date, end_date, start_time, end_time, description } = req.body;
        const schedule = await GPSchedule.create({ start_date, end_date, start_time, end_time, description });
        res.status(201).json(schedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteGPSchedule = async (req, res) => {
    try {
        await GPSchedule.findByIdAndDelete(req.params.id);
        res.json({ message: 'GP Schedule deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Academic Calendar CRUD ---
const getAcademicEvents = async (req, res) => {
    try {
        const events = await AcademicCalendar.find().sort({ start_date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAcademicEvent = async (req, res) => {
    try {
        const { event_name, event_type, start_date, end_date, description } = req.body;
        const event = await AcademicCalendar.create({ event_name, event_type, start_date, end_date, description });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAcademicEvent = async (req, res) => {
    try {
        const { event_name, event_type, start_date, end_date, description } = req.body;
        const event = await AcademicCalendar.findByIdAndUpdate(req.params.id,
            { event_name, event_type, start_date, end_date, description },
            { new: true }
        );
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAcademicEvent = async (req, res) => {
    try {
        await AcademicCalendar.findByIdAndDelete(req.params.id);
        res.json({ message: 'Academic Event deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createDepartment = async (req, res) => {
    try {
        const { dept_name } = req.body;
        if (!dept_name) return res.status(400).json({ message: 'Department name is required' });
        
        const existing = await Department.findOne({ dept_name });
        if (existing) return res.status(400).json({ message: 'Department already exists' });
        
        const department = await Department.create({ dept_name });
        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats,
    getUsers,
    toggleBlockUser,
    deleteUser,
    getAnalytics,
    assignFaculty,
    getMappings,
    saveDeptMentor,
    saveHostelWarden,
    deleteMapping,
    recalculateAssignments,
    getUniqueDepartments,
    getUniqueHostels,
    createDepartment,
    getGPSchedules,
    createGPSchedule,
    deleteGPSchedule,
    getAcademicEvents,
    createAcademicEvent,
    updateAcademicEvent,
    deleteAcademicEvent
};
