const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    wardenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        default: ''
    },
    student_type: {
        type: String,
        enum: ['Hosteller', 'Dayscholar'],
        required: true
    },
    period: {
        type: String, // 'Half Day', 'Full Day', 'Multiple Days'
        default: ''
    },
    leaveType: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    mentorStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Not Required'],
        default: 'Not Required'
    },
    wardenStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Not Required'],
        default: 'Not Required'
    },
    parent_otp: {
        type: String,
        default: null
    },
    parent_otp_expiry: {
        type: Date,
        default: null
    },
    parent_token: {
        type: String,
        default: null
    },
    parent_token_expiry: {
        type: Date,
        default: null
    },
    parent_email: {
        type: String,
        default: null
    },
    parent_status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Not Required'],
        default: 'Pending'
    },
    approval_method: {
        type: String,
        enum: ['LINK', 'OTP', 'OTP_MENTOR', null],
        default: null
    },
    approvalStatus: [{
        role: String,
        facultyId: String,
        facultyName: String,
        facultyDepartment: String,
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected', 'Not Required'],
            default: 'Pending'
        },
        approvedBy: String,
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Event Details for OD Leave
    event_name: {
        type: String,
        default: ''
    },
    event_organizer: {
        type: String,
        default: ''
    },
    event_location: {
        type: String,
        default: ''
    },
    event_start_date: {
        type: Date
    },
    event_end_date: {
        type: Date
    },
    event_description: {
        type: String,
        default: ''
    },
    proof_document: {
        type: String,
        default: ''
    },
    // Domain Approval for OD Leave
    domain_authority: {
        type: String,
        enum: ['Placement Cell', 'Clubs Coordinator', 'IECC', ''],
        default: ''
    },
    domain_approval_status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', null],
        default: null
    },
    domain_approved_by: {
        type: String,
        default: ''
    },
    domain_approval_date: {
        type: Date
    },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        default: null
    },
    // Dynamic Fields for OD
    od_details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Leave', leaveSchema);
