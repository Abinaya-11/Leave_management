const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin', 'placement_cell', 'clubs_coordinator', 'iecc'],
        default: 'student'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    department: {
        type: String,
        default: 'General'
    },
    student_type: {
        type: String,
        enum: ['Hosteller', 'Dayscholar'],
        required: function () { return this.role === 'student'; }
    },
    // Legacy support for existing users
    studentType: {
        type: String
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    warden: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    register_no: {
        type: String,
        required: function () { return this.role === 'student'; },
        unique: true,
        sparse: true // Allows null/empty for non-students
    },
    year: {
        type: String
    },
    hostel_name: {
        type: String,
        required: function () {
            return this.role === 'student' && (this.student_type === 'Hosteller' || (this.studentType && this.studentType.toUpperCase() === 'HOSTELLER'));
        }
    },
    floor: {
        type: String,
        required: function () {
            return this.role === 'student' && (this.student_type === 'Hosteller' || (this.studentType && this.studentType.toUpperCase() === 'HOSTELLER'));
        }
    },
    room_no: {
        type: String,
        required: function () {
            return this.role === 'student' && (this.student_type === 'Hosteller' || (this.studentType && this.studentType.toUpperCase() === 'HOSTELLER'));
        }
    },
    faculty_id: {
        type: String,
        unique: true,
        sparse: true
    },
    parent_name: {
        type: String,
        default: null
    },
    parent_email: {
        type: String,
        default: null
    },
    phone_number: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
