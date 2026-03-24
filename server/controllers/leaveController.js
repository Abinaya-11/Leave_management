const Leave = require('../models/Leave');
const User = require('../models/User');
const Notification = require('../models/Notification');
const GPSchedule = require('../models/GPSchedule');
const AcademicCalendar = require('../models/AcademicCalendar');
const Event = require('../models/Event');
const { sendParentApprovalEmail } = require('../utils/emailService');
const crypto = require('crypto');

// Removed Simulated SMS Integration in favor of Email


// @desc    Apply for a leave
// @route   POST /api/leaves/apply
// @access  Private (Student)
const applyLeave = async (req, res) => {
    try {
        const { 
            startDate, endDate, startTime, endTime, duration, period, leaveType, reason,
            eventName, eventOrganizer, eventLocation, eventStartDate, eventEndDate, eventDescription, proofDocument,
            od_details
        } = req.body;

        // Ensure user is attached
        if (!req.body.studentId) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        const student = await User.findById(req.body.studentId)
            .populate('mentor', 'name email department')
            .populate('warden', 'name email department');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const odLeaveTypes = [
            "ONDUTY_EVENTS", "ONDUTY_PROJECT_COMP", "ONDUTY_INTERNSHIP",
            "ONDUTY_PAPER_PRESENTATION", "ONDUTY_TECH_COMP", "ONDUTY_NSS_NCC",
            "ONDUTY_SPORTS", "ONDUTY_NPTEL", "ONDUTY_OFFCAMPUS", "ONDUTY_TRAINING",
            "ONDUTY_GOVT_EXAM", "ONDUTY_CLUBS"
        ];

        const hostellerLeaveTypes = [
            ...odLeaveTypes, "SP", "GP", "SICK", "EMERGENCY"
        ];
        const dayscholarLeaveTypes = [
            ...odLeaveTypes, "GENERAL_LEAVE"
        ];

        const studentType = student.student_type || student.studentType;
        const normalizedType = studentType?.toUpperCase();

        if (normalizedType === 'HOSTELLER') {
            if (!hostellerLeaveTypes.includes(leaveType)) {
                return res.status(400).json({ message: `Leave type ${leaveType} is not allowed for Hostellers` });
            }
        } else if (normalizedType === 'DAYSCHOLAR') {
            if (!dayscholarLeaveTypes.includes(leaveType)) {
                return res.status(400).json({ message: `Leave type ${leaveType} is not allowed for Dayscholars` });
            }
        }

        let domainAuthority = '';
        let domainApprovalStatus = null;
        let eventData = null;

        if (odLeaveTypes.includes(leaveType)) {
            domainApprovalStatus = 'Pending';
            
            if (req.body.event_id) {
                eventData = await Event.findById(req.body.event_id);
                if (!eventData) {
                    return res.status(404).json({ message: 'Selected event not found' });
                }
                domainAuthority = eventData.organizing_cell;
            } else {
                // Fallback for manual entry (legacy) or if event_id not provided
                if (["ONDUTY_INTERNSHIP", "ONDUTY_OFFCAMPUS", "ONDUTY_TRAINING"].includes(leaveType)) {
                    domainAuthority = 'Placement Cell';
                } else if (["ONDUTY_SPORTS", "ONDUTY_CLUBS", "ONDUTY_NSS_NCC"].includes(leaveType)) {
                    domainAuthority = 'Clubs Coordinator';
                } else {
                    domainAuthority = 'IECC';
                }
            }
        }

        let approvalHierarchy = [];

        // The `normalizedType` variable is already defined and normalized to uppercase above for leave type validation.
        // For the approval hierarchy logic, we need it in lowercase as used below.
        // Re-normalizing to lowercase here for clarity, or we could use the uppercase one and adjust the 'hosteller'/'dayscholar' checks.
        // Given the existing code, it's better to keep the `toLowerCase()` for the approval logic.
        const normalizedTypeForApproval = studentType?.toLowerCase();

        const mentorId = student.mentor?._id;
        const wardenId = student.warden?._id;

        if (normalizedTypeForApproval === 'hosteller') {
            const isSpecialLeave = leaveType === 'SICK' || leaveType === 'EMERGENCY';
            const isGP = leaveType === 'GP';

            if (isSpecialLeave || isGP) {
                // Rule: Only Warden for Sick/Emergency/GP
                approvalHierarchy.push({
                    role: 'Hostel Warden',
                    status: 'Pending',
                    facultyId: wardenId || 'TBD',
                    facultyName: student.warden?.name || 'Assigned Warden'
                });
            } else {
                // Rule: Mentor then Warden
                approvalHierarchy.push({
                    role: 'Mentor',
                    status: 'Pending',
                    facultyId: mentorId || 'TBD',
                    facultyName: student.mentor?.name || 'Assigned Mentor'
                });
                approvalHierarchy.push({
                    role: 'Hostel Warden',
                    status: 'Pending',
                    facultyId: wardenId || 'TBD',
                    facultyName: student.warden?.name || 'Assigned Warden'
                });
            }
        } else {
            // Dayscholar: Only Mentor
            approvalHierarchy.push({
                role: 'Mentor',
                status: 'Pending',
                facultyId: mentorId || 'TBD',
                facultyName: student.mentor?.name || 'Assigned Mentor'
            });
        }

        const isSpecialHostellerLeave = normalizedTypeForApproval === 'hosteller' &&
            (leaveType === 'SICK' || leaveType === 'EMERGENCY');

        // 1. GP Automated Data Population (Move this ABOVE validation)
        let finalStartDate = startDate;
        let finalEndDate = endDate;
        let finalStartTime = req.body.startTime;
        let finalEndTime = req.body.endTime;
        let finalReason = req.body.reason;

        if (leaveType === 'GP') {
            const latestGP = await GPSchedule.findOne().sort({ createdAt: -1 });
            if (!latestGP) {
                return res.status(400).json({ message: 'No GP schedule found. Please contact admin.' });
            }

            // Robustness: Handle old records that might not have the new fields
            if (!latestGP.start_date || !latestGP.end_date) {
                return res.status(400).json({
                    message: 'The current GP schedule is outdated. Please ask Admin to delete existing schedules and create a new one.'
                });
            }

            finalStartDate = latestGP.start_date;
            finalEndDate = latestGP.end_date;
            finalStartTime = latestGP.start_time;
            finalEndTime = latestGP.end_time;
            finalReason = 'GP';
        }

        // 2. Past Date/Time Validation (Present and Future only)
        if (leaveType !== 'GP') {
            const now = new Date();
            const rawFromTime = req.body.fromTime || '00:00';
            const startDateTime = new Date(`${finalStartDate}T${rawFromTime}`);
            
            if (startDateTime < new Date(now.getTime() - 300000)) {
                return res.status(400).json({ message: 'Leave start date and time cannot be in the past' });
            }
        }

        // 3. Overlapping Leave Validation (Use finalStartDate/finalEndDate)
        const existingLeave = await Leave.findOne({
            studentId: req.body.studentId,
            status: { $ne: 'Rejected' },
            $or: [
                {
                    startDate: { $lte: new Date(finalEndDate) },
                    endDate: { $gte: new Date(finalStartDate) }
                }
            ]
        });

        if (existingLeave) {
            return res.status(400).json({ message: 'Leave already exists for the selected dates. Please choose different dates.' });
        }

        // Hybrid Email-Based Parent Approval Flow
        const parentOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const parentToken = crypto.randomBytes(32).toString('hex');
        
        // Expiries
        const otpExpiry = new Date();
        otpExpiry.setFullYear(otpExpiry.getFullYear() + 99); // practically non-expiring
        
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours

        const leave = await Leave.create({
            studentId: req.body.studentId,
            mentorId,
            wardenId,
            leaveType,
            startDate: finalStartDate,
            endDate: finalEndDate,
            startTime: finalStartTime,
            endTime: finalEndTime,
            period: req.body.period,
            reason: finalReason,
            duration: req.body.duration,
            student_type: normalizedTypeForApproval === 'hosteller' ? 'Hosteller' : 'Dayscholar',
            mentorStatus: (isSpecialHostellerLeave || leaveType === 'GP') ? 'Not Required' : 'Pending',
            wardenStatus: (isSpecialHostellerLeave || leaveType === 'GP') ? 'Pending' : (normalizedTypeForApproval === 'hosteller' ? 'Pending' : 'Not Required'),
            approvalStatus: approvalHierarchy,
            status: 'Pending',
            // Parent Hybrid Approval fields
            parent_status: 'Pending',
            parent_otp: parentOtp,
            parent_otp_expiry: otpExpiry,
            parent_token: parentToken,
            parent_token_expiry: tokenExpiry,
            parent_email: student.parent_email || req.body.parent_email,
            // OD Fields
            event_name: eventData ? eventData.event_name : eventName,
            event_organizer: eventData ? eventData.event_organizer : eventOrganizer,
            event_location: eventData ? eventData.event_location : eventLocation,
            event_start_date: eventData ? eventData.event_start_date : eventStartDate,
            event_end_date: eventData ? eventData.event_end_date : eventEndDate,
            event_description: eventData ? eventData.event_description : eventDescription,
            proof_document: proofDocument,
            domain_authority: domainAuthority,
            domain_approval_status: domainApprovalStatus,
            event_id: req.body.event_id || null,
            od_details: od_details || {}
        });

        // Send Parent Approval Email
        const approveUrl = `http://localhost:5173/parent-approve/${leave._id}?token=${parentToken}&decision=Approved`;
        const rejectUrl = `http://localhost:5173/parent-approve/${leave._id}?token=${parentToken}&decision=Rejected`;
        
        await sendParentApprovalEmail(student, leave, approveUrl, rejectUrl, parentOtp);

        // Send Notification to Mentor for Sick/Emergency Leaves (Hosteller) - FYI Only
        if ((isSpecialHostellerLeave || leaveType === 'GP') && mentorId) {
            try {
                const student = await User.findById(req.body.studentId);
                let message = '';
                if (leaveType === 'GP') {
                    message = `Your student ${student.name || 'Student'} applied for GP. (FYI Only, Warden approves)`;
                } else {
                    const readableType = leaveType === 'SICK' ? 'Sick' : 'Emergency';
                    message = `Your student ${student.name || 'Student'} applied ${readableType} Leave.`;
                }

                await Notification.create({
                    recipient: mentorId,
                    sender: req.body.studentId,
                    message: message,
                    type: 'LEAVE_REQUEST',
                    leaveId: leave._id
                });
            } catch (notifyErr) {
                console.error("Failed to send notification to mentor:", notifyErr);
            }
        }
        
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
        const studentId = req.params.id || req.user.id;
        console.log('Fetching leaves for studentId:', studentId);
        const leaves = await Leave.find({ studentId }).sort({ createdAt: -1 });
        console.log(`Found ${leaves.length} leaves for student ${studentId}`);

        if (!leaves || leaves.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No leave history found"
            });
        }

        const mappedLeaves = leaves.map(leave => {
            const l = leave.toObject();
            return {
                ...l,
                _id: leave._id.toString(),
                leave_type: leave.leaveType,
                from_date: leave.startDate,
                to_date: leave.endDate,
                mentor_status: leave.mentorStatus,
                warden_status: leave.wardenStatus,
                overall_status: leave.status,
                reason: leave.reason,
                created_at: leave.createdAt
            };
        });

        res.json({
            success: true,
            data: mappedLeaves
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all leaves (for Faculty dashboard - Restricted)
// @route   GET /api/leaves/all
// @access  Private (Faculty)
const getAllLeaves = async (req, res) => {
    try {
        const facultyId = req.user.id;
        const role = req.user.role;

        let query = {};
        const domainRoles = ['placement_cell', 'clubs_coordinator', 'iecc'];
        
        if (role !== 'admin') {
            if (domainRoles.includes(role)) {
                let authorityName = '';
                if (role === 'placement_cell') authorityName = 'Placement Cell';
                else if (role === 'clubs_coordinator') authorityName = 'Clubs Coordinator';
                else if (role === 'iecc') authorityName = 'IECC';

                query = {
                    domain_authority: authorityName,
                    domain_approval_status: 'Pending'
                };
            } else {
                // Faculty (Mentor/Warden): See all assigned students
                query = {
                    $or: [
                        { mentorId: facultyId },
                        { wardenId: facultyId }
                    ]
                };
            }
        }

        const leaves = await Leave.find(query)
            .populate('studentId', 'name email department hostel_name floor student_type studentType register_no registerNo')
            .sort({ createdAt: -1 });

        // Visibility filtering for faculty and domain authorities
        let resultLeaves = leaves;
        if (role !== 'admin') {
            if (!domainRoles.includes(role)) {
                // Faculty-specific filtering
                resultLeaves = leaves.filter(leave => {
                    const isMentor = leave.mentorId && leave.mentorId.toString() === facultyId;
                    const isWarden = leave.wardenId && leave.wardenId.toString() === facultyId;

                    const studentTypeRaw = (leave.student_type || leave.studentId?.student_type || leave.studentId?.studentType || '').toUpperCase();
                    const isHosteller = studentTypeRaw === 'HOSTELLER';

                    // Mentors/Wardens see all their assigned leaves
                    if (isMentor) {
                        const lType = leave.leaveType;
                        const isSpecialLeave = lType === 'SICK' || lType === 'EMERGENCY' || lType === 'GP';
                        if (isHosteller && isSpecialLeave) return false;
                        return true;
                    }

                    if (isWarden && isHosteller) return true;

                    return false;
                });
            }
        }

        res.json(resultLeaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or Reject leave (Mentor/Warden Restricted)
// @route   PUT /api/leaves/:id
// @access  Private (Faculty)
const updateLeaveStatus = async (req, res) => {
    try {
        const { status, adminRemark } = req.body;
        const facultyId = req.user.id;
        const role = req.user.role;

        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        const domainRoles = ['placement_cell', 'clubs_coordinator', 'iecc'];
        const isDomainAuthority = domainRoles.includes(role);

        // Identify role of the current user for THIS leave
        const isMentor = leave.mentorId && leave.mentorId.toString() === facultyId;
        const isWarden = leave.wardenId && leave.wardenId.toString() === facultyId;

        if (!isMentor && !isWarden && role !== 'admin' && !isDomainAuthority) {
            return res.status(403).json({ message: 'Not authorized to approve this leave' });
        }

        // Domain Authority Action
        if (isDomainAuthority) {
            let authorityName = '';
            if (role === 'placement_cell') authorityName = 'Placement Cell';
            else if (role === 'clubs_coordinator') authorityName = 'Clubs Coordinator';
            else if (role === 'iecc') authorityName = 'IECC';

            if (leave.domain_authority !== authorityName) {
                return res.status(403).json({ message: 'Not authorized for this domain' });
            }

            leave.domain_approval_status = status;
            leave.domain_approved_by = req.user.name;
            leave.domain_approval_date = Date.now();

            if (status === 'Rejected') {
                leave.status = 'Rejected';
            }
        } else {
            // Identify role and update relevant field
            if (isMentor) {
                leave.mentorStatus = status;
            } else if (isWarden) {
                leave.wardenStatus = status;
            }

            // --- Approval/Rejection Logic ---
            const odLeaveTypes = [
                "ONDUTY_EVENTS", "ONDUTY_PROJECT_COMP", "ONDUTY_INTERNSHIP",
                "ONDUTY_PAPER_PRESENTATION", "ONDUTY_TECH_COMP", "ONDUTY_NSS_NCC",
                "ONDUTY_SPORTS", "ONDUTY_NPTEL", "ONDUTY_OFFCAMPUS", "ONDUTY_TRAINING",
                "ONDUTY_GOVT_EXAM", "ONDUTY_CLUBS"
            ];
            if (leave.mentorStatus === 'Rejected' || leave.wardenStatus === 'Rejected' || leave.parent_status === 'Rejected' || leave.domain_approval_status === 'Rejected') {
                leave.status = 'Rejected';
            } else {
                const isOD = odLeaveTypes.includes(leave.leaveType);
                const isSpecialLeave = leave.leaveType === 'SICK' || leave.leaveType === 'EMERGENCY' || leave.leaveType === 'GP';
                const sType = (leave.student_type || '').toUpperCase();
                const isHosteller = sType === 'HOSTELLER';
                
                let isFacultyApproved = false;
                if (isHosteller) {
                    if (isSpecialLeave) {
                        isFacultyApproved = leave.wardenStatus === 'Approved';
                    } else {
                        isFacultyApproved = leave.mentorStatus === 'Approved' && leave.wardenStatus === 'Approved';
                    }
                } else {
                    // Dayscholar
                    isFacultyApproved = leave.mentorStatus === 'Approved';
                }

                const isDomainApproved = isOD ? (leave.domain_approval_status === 'Approved') : true;
                const isParentApproved = leave.parent_status === 'Approved';

                if (isFacultyApproved && isDomainApproved && isParentApproved) {
                    leave.status = 'Approved';
                } else {
                    leave.status = 'Pending';
                }
            }

            // Update the approvalStatus array for history/compatibility
            leave.approvalStatus.forEach(entry => {
                if (isMentor && (entry.role === 'Mentor' || entry.role === 'Assigned Mentor')) {
                    entry.status = status;
                    entry.approvedBy = facultyId;
                    entry.facultyName = req.user.name;
                    entry.facultyDepartment = req.user.department;
                    entry.updatedAt = Date.now();
                }
                if (isWarden && (entry.role === 'Hostel Warden' || entry.role === 'Assigned Warden')) {
                    entry.status = status;
                    entry.approvedBy = facultyId;
                    entry.facultyName = req.user.name;
                    entry.facultyDepartment = req.user.department;
                    entry.updatedAt = Date.now();
                }
            });
        }

        leave.adminRemark = adminRemark || leave.adminRemark;

        const updatedLeave = await leave.save();

        // --- Notification Logic: Notify Student ---
        let message = `Your leave request status is now: ${leave.status}`;
        if (isDomainAuthority) {
            message = `Domain Authority (${leave.domain_authority}) has ${status.toLowerCase()} your OD request.`;
        }

        await Notification.create({
            recipient: leave.studentId,
            sender: facultyId,
            message: message,
            type: 'LEAVE_STATUS_UPDATE',
            leaveId: leave._id
        });

        // Notify Mentor if Domain Authority Approves
        if (isDomainAuthority && status === 'Approved') {
            const student = await User.findById(leave.studentId);
            if (leave.mentorId) {
                await Notification.create({
                    recipient: leave.mentorId,
                    sender: facultyId,
                    message: `OD leave request for ${student.name} approved by Domain Authority. Waiting for your approval.`,
                    type: 'LEAVE_REQUEST',
                    leaveId: leave._id
                });
            }
        }

        res.json(updatedLeave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAcademicCalendar = async (req, res) => {
    try {
        const events = await AcademicCalendar.find().sort({ start_date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get leave details for parent (Public)
// @route   GET /api/leaves/public/:id
// @access  Public
const getPublicLeaveDetails = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id)
            .populate('studentId', 'name register_no department student_type parent_name');

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const parentApproveLeave = async (req, res) => {
    try {
        const { otp, decision } = req.body; 
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (leave.parent_status !== 'Pending') {
            return res.status(400).json({ message: 'Already processed' });
        }

        if (decision === 'Approved') {
            if (otp !== leave.parent_otp) {
                return res.status(400).json({ message: 'Invalid OTP' });
            }
            if (new Date() > leave.parent_otp_expiry) {
                return res.status(400).json({ message: 'OTP expired' });
            }
            leave.parent_status = 'Approved';
            leave.approval_method = 'OTP';
        } else {
            leave.parent_status = 'Rejected';
            leave.approval_method = 'OTP';
        }

        // --- Recalculate overall status ---
        updateOverallStatus(leave);

        const updatedLeave = await leave.save();
        await notifyStudentOfParentDecision(leave, decision, leave.mentorId || leave.studentId);
        if (decision === 'Approved') await notifyFacultyOfParentApproval(leave);

        res.json({ success: true, message: "✅ Response recorded successfully", status: leave.status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Parent Approve/Reject leave via Secure Token (Link)
// @route   GET /api/leaves/public/:id/parent-token-decision
// @access  Public
const parentDecisionByToken = async (req, res) => {
    try {
        const { token, decision } = req.query;
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (leave.parent_status !== 'Pending') {
            return res.status(400).json({ message: 'Already processed' });
        }

        if (token !== leave.parent_token) {
            return res.status(403).json({ message: 'Invalid secure token' });
        }

        if (new Date() > leave.parent_token_expiry) {
            return res.status(400).json({ message: 'Link expired (24h limit)' });
        }

        leave.parent_status = decision === 'Approved' ? 'Approved' : 'Rejected';
        leave.approval_method = 'LINK';

        updateOverallStatus(leave);

        await leave.save();
        await notifyStudentOfParentDecision(leave, decision, leave.mentorId || leave.studentId);
        if (decision === 'Approved') await notifyFacultyOfParentApproval(leave);

        res.json({ success: true, message: "✅ Response recorded successfully", status: leave.status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mentor verify parent OTP (Fallback)
// @route   POST /api/leaves/mentor/verify-parent-otp
// @access  Private (Faculty/Mentor)
const verifyParentOtpByMentor = async (req, res) => {
    try {
        const { leave_id, otp } = req.body;
        const leave = await Leave.findById(leave_id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        if (leave.parent_status !== 'Pending') {
            console.log("OTP verification failed. Current parent_status:", leave.parent_status);
            return res.status(400).json({ message: 'Already processed' });
        }

        if (otp !== leave.parent_otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > leave.parent_otp_expiry) {
            return res.status(400).json({ success: false, message: "Invalid or Expired OTP" });
        }

        leave.parent_status = 'Approved';
        leave.approval_method = 'OTP_MENTOR';

        updateOverallStatus(leave);

        await leave.save();
        await notifyStudentOfParentDecision(leave, 'Approved', req.user.id);
        await notifyFacultyOfParentApproval(leave);

        res.json({ success: true, message: 'Parent OTP verified successfully', status: leave.status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to update overall leave status
const updateOverallStatus = (leave) => {
    if (leave.mentorStatus === 'Rejected' || leave.wardenStatus === 'Rejected' || leave.parent_status === 'Rejected' || leave.domain_approval_status === 'Rejected') {
        leave.status = 'Rejected';
    } else {
        const odLeaveTypes = [
            "ONDUTY_EVENTS", "ONDUTY_PROJECT_COMP", "ONDUTY_INTERNSHIP",
            "ONDUTY_PAPER_PRESENTATION", "ONDUTY_TECH_COMP", "ONDUTY_NSS_NCC",
            "ONDUTY_SPORTS", "ONDUTY_NPTEL", "ONDUTY_OFFCAMPUS", "ONDUTY_TRAINING",
            "ONDUTY_GOVT_EXAM", "ONDUTY_CLUBS"
        ];
        const isOD = odLeaveTypes.includes(leave.leaveType);
        const isSpecialLeave = leave.leaveType === 'SICK' || leave.leaveType === 'EMERGENCY' || leave.leaveType === 'GP';
        const sType = (leave.student_type || '').toUpperCase();
        const isHosteller = sType === 'HOSTELLER';
        
        let isFacultyApproved = false;
        if (isHosteller) {
            if (isSpecialLeave) {
                isFacultyApproved = leave.wardenStatus === 'Approved';
            } else {
                isFacultyApproved = leave.mentorStatus === 'Approved' && leave.wardenStatus === 'Approved';
            }
        } else {
            isFacultyApproved = leave.mentorStatus === 'Approved';
        }

        const isDomainApproved = isOD ? (leave.domain_approval_status === 'Approved') : true;
        const isParentApproved = leave.parent_status === 'Approved';

        if (isFacultyApproved && isDomainApproved && isParentApproved) {
            leave.status = 'Approved';
        } else {
            leave.status = 'Pending';
        }
    }
};

const notifyStudentOfParentDecision = async (leave, decision, senderId) => {
    await Notification.create({
        recipient: leave.studentId,
        sender: senderId || leave.mentorId || leave.studentId,
        message: `Your parent has ${decision.toLowerCase()} your leave request. Overall status: ${leave.status}`,
        type: 'LEAVE_STATUS_UPDATE',
        leaveId: leave._id
    });
};

const notifyFacultyOfParentApproval = async (leave) => {
    const student = await User.findById(leave.studentId);
    const approvers = [];
    if (leave.mentorId) approvers.push(leave.mentorId);
    if (leave.wardenId) approvers.push(leave.wardenId);

    for (const adminId of approvers) {
        await Notification.create({
            recipient: adminId,
            sender: leave.studentId,
            message: `New leave request from ${student.name} (Parent Approved)`,
            type: 'LEAVE_REQUEST',
            leaveId: leave._id
        });
    }
};

module.exports = {
    applyLeave,
    getStudentLeaves,
    getAllLeaves,
    updateLeaveStatus,
    getAcademicCalendar,
    getPublicLeaveDetails,
    parentApproveLeave,
    parentDecisionByToken,
    verifyParentOtpByMentor
};
