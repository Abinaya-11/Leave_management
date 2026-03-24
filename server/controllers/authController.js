const User = require('../models/User');
const DeptMentor = require('../models/DeptMentor');
const HostelWarden = require('../models/HostelWarden');
const Department = require('../models/Department');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        let { name, register_no, email, password, role, department, student_type, hostel_name, floor, room_no } = req.body;

        // Backend Validation for Hosteller
        let finalHostel = null;
        let finalFloor = null;
        let finalRoom = null;

        if (role === 'student' && student_type?.toUpperCase() === 'HOSTELLER') {
            if (!hostel_name || !floor || !room_no) {
                return res.status(400).json({ message: "Hostel Name, Floor and Room No are required for Hostellers" });
            }
            finalHostel = hostel_name;
            finalFloor = floor;
            finalRoom = room_no;
        }

        // Fix Duplicate Key error for register_no: 
        // Ensure it's undefined if role is not student or if it's an empty string.
        // Sparse index only ignores null/undefined, not empty strings.
        if (role !== 'student' || !register_no) {
            register_no = undefined;
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Auto Assignment Logic for Students
        let mentorId = null;
        let wardenId = null;

        if (role === 'student') {
            // 0. Auto-add Department if missing
            if (department) {
                const deptExists = await Department.findOne({ dept_name: department });
                if (!deptExists) {
                    await Department.create({ dept_name: department });
                }
            }

            // 1. Department Mentor Assignment
            if (department) {
                const deptMentor = await DeptMentor.findOne({ department: department });
                if (deptMentor) {
                    mentorId = deptMentor.faculty;
                }
            }

            // 2. Hostel Warden Assignment
            if (student_type?.toUpperCase() === 'HOSTELLER' && finalHostel && finalFloor) {
                const hostelWarden = await HostelWarden.findOne({
                    hostel_name: finalHostel,
                    floor: finalFloor
                });
                if (hostelWarden) {
                    wardenId = hostelWarden.faculty;
                }
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let faculty_id = undefined;
        if (role === 'faculty') {
            const lastFaculty = await User.findOne({ role: 'faculty' }).sort({ createdAt: -1 });
            let nextNum = 1;
            if (lastFaculty && lastFaculty.faculty_id) {
                const lastNum = parseInt(lastFaculty.faculty_id.replace('FAC', ''));
                if (!isNaN(lastNum)) {
                    nextNum = lastNum + 1;
                }
            }
            faculty_id = `FAC${nextNum.toString().padStart(3, '0')}`;
        }

        const user = await User.create({
            name,
            register_no,
            email,
            password: hashedPassword,
            role,
            department,
            student_type,
            hostel_name: finalHostel,
            floor: finalFloor,
            room_no: finalRoom,
            mentor: mentorId,
            warden: wardenId,
            faculty_id
        });

        if (user) {
            const populatedUser = await User.findById(user._id).populate('mentor', 'name').populate('warden', 'name');
            res.status(201).json({
                _id: populatedUser.id,
                name: populatedUser.name,
                email: populatedUser.email,
                role: populatedUser.role,
                student_type: populatedUser.student_type,
                mentor_name: populatedUser.mentor?.name,
                warden_name: populatedUser.warden?.name,
                isLeaveBlocked: populatedUser.isLeaveBlocked,
                leaveBlockedReason: populatedUser.leaveBlockedReason,
                token: generateToken(populatedUser._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Check if user is blocked
            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account is blocked by Admin' });
            }

            let student_type = user.student_type;
            if (!student_type && user.studentType) {
                const legacy = user.studentType.toUpperCase();
                if (legacy === 'HOSTELLER') student_type = 'Hosteller';
                else if (legacy === 'DAYSCHOLAR') student_type = 'Dayscholar';
                else student_type = user.studentType;
            }

            // Final fallback to avoid undefined/N/A
            if (user.role === 'student' && !student_type) {
                student_type = 'Dayscholar';
            }

            // Optional: Re-sync assignments on login if they are missing
            if (user.role === 'student') {
                let needsUpdate = false;
                if (!user.mentor && user.department) {
                    const dm = await DeptMentor.findOne({ department: user.department });
                    if (dm) { user.mentor = dm.faculty; needsUpdate = true; }
                }
                const currentType = student_type || user.student_type || user.studentType;
                if (!user.warden && currentType?.toUpperCase() === 'HOSTELLER' && user.hostel_name && user.floor) {
                    const hw = await HostelWarden.findOne({ hostel_name: user.hostel_name, floor: user.floor });
                    if (hw) { user.warden = hw.faculty; needsUpdate = true; }
                }
                if (needsUpdate) await user.save();
            }

            const populatedUser = await User.findById(user._id).populate('mentor', 'name').populate('warden', 'name');
            res.json({
                _id: populatedUser.id,
                name: populatedUser.name,
                email: populatedUser.email,
                role: populatedUser.role,
                student_type,
                department: populatedUser.department,
                hostel_name: populatedUser.hostel_name,
                floor: populatedUser.floor,
                room_no: populatedUser.room_no,
                parent_name: populatedUser.parent_name,
                parent_email: populatedUser.parent_email,
                phone_number: populatedUser.phone_number,
                year: populatedUser.year,
                faculty_id: populatedUser.faculty_id,
                mentor_name: populatedUser.mentor?.name,
                warden_name: populatedUser.warden?.name,
                isLeaveBlocked: populatedUser.isLeaveBlocked,
                leaveBlockedReason: populatedUser.leaveBlockedReason,
                token: generateToken(populatedUser._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Update Parent Details (Name & Mobile)
// @route   PUT /api/auth/update-parent-details
// @access  Private (Student)
const updateParentDetails = async (req, res) => {
    try {
        const { parent_name, parent_email } = req.body;
        
        if (!parent_name || !parent_email) {
            return res.status(400).json({ message: 'Parent name and valid email address are required.' });
        }

        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(parent_email)) {
            return res.status(400).json({ message: 'Please provide a valid email address.' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { parent_name, parent_email },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ 
            success: true, 
            message: 'Parent details updated successfully!',
            parent_name: user.parent_name,
            parent_email: user.parent_email
        });
    } catch (error) {
        console.error('Update Parent Details Error:', error);
        res.status(500).json({ message: error.message || 'Error updating parent details' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, phone_number, year } = req.body;
        
        const updateData = {};
        if (name) updateData.name = name;
        if (phone_number !== undefined) updateData.phone_number = phone_number;
        if (year) updateData.year = year;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('mentor', 'name').populate('warden', 'name');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            user: {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                student_type: user.student_type,
                department: user.department,
                hostel_name: user.hostel_name,
                floor: user.floor,
                room_no: user.room_no,
                phone_number: user.phone_number,
                year: user.year,
                faculty_id: user.faculty_id,
                mentor_name: user.mentor?.name,
                warden_name: user.warden?.name,
                isLeaveBlocked: user.isLeaveBlocked,
                leaveBlockedReason: user.leaveBlockedReason,
                totalLeaveTaken: user.totalLeaveTaken
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateParentDetails,
    updateProfile
};
