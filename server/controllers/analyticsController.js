const Leave = require('../models/Leave');
const Settings = require('../models/Settings');

// @desc    Get student leave pattern
// @route   GET /api/student/leave-pattern
// @access  Private
exports.getLeavePattern = async (req, res) => {
    try {
        const studentId = req.user._id;
        const leaves = await Leave.find({ studentId, status: 'Approved' });

        let mondayFridayCount = 0;
        let lastMinuteCount = 0;
        let consecutiveCount = 0;

        leaves.forEach((leave, index) => {
            const start = new Date(leave.startDate);
            const appliedAt = new Date(leave.createdAt);

            // 1. Monday/Friday Pattern
            const day = start.getDay();
            if (day === 1 || day === 5) mondayFridayCount++;

            // 2. Last-minute detection (applied on same day or day before)
            const diffInTime = start.getTime() - appliedAt.getTime();
            const diffInDays = diffInTime / (1000 * 3600 * 24);
            if (diffInDays < 1) lastMinuteCount++;

            // 3. Consecutive leaves
            if (index > 0) {
                const prevLeave = leaves[index - 1];
                const prevEnd = new Date(prevLeave.endDate);
                const timeDiff = start.getTime() - prevEnd.getTime();
                const dayDiff = timeDiff / (1000 * 3600 * 24);
                if (dayDiff <= 1) consecutiveCount++;
            }
        });

        const threshold = 3;
        const mondayFridayPattern = mondayFridayCount >= threshold;
        
        let warningMessage = "";
        if (mondayFridayPattern) warningMessage += "Frequent Monday/Friday leaves detected. ";
        if (consecutiveCount >= threshold) warningMessage += "Frequent consecutive leaves detected. ";
        if (lastMinuteCount >= threshold) warningMessage += "Multiple last-minute applications detected.";

        res.json({
            mondayFridayPattern,
            consecutiveLeaves: consecutiveCount,
            lastMinuteLeaves: lastMinuteCount,
            warningMessage: warningMessage.trim()
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get attendance summary
// @route   GET /api/student/attendance-summary
// @access  Private
exports.getAttendanceSummary = async (req, res) => {
    try {
        const studentId = req.user._id;
        const settings = await Settings.findOne() || { maxLeavePerSemester: 8, totalWorkingDays: 90 };
        const leaves = await Leave.find({ studentId, status: 'Approved' });

        let totalLeaveDays = 0;
        leaves.forEach(leave => {
            if (leave.duration) {
                const dur = parseFloat(leave.duration);
                if (!isNaN(dur)) {
                    totalLeaveDays += dur;
                    return;
                }
            }
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            totalLeaveDays += (isNaN(diff) ? 1 : diff);
        });

        const totalWorkingDays = settings.totalWorkingDays;
        const presentDays = Math.max(0, totalWorkingDays - totalLeaveDays);
        const attendancePercentage = ((presentDays / totalWorkingDays) * 100).toFixed(2);

        let warningMessage = "";
        if (totalLeaveDays >= settings.maxLeavePerSemester) {
            warningMessage = "You have exceeded your max leave limit for this semester.";
        } else if (totalLeaveDays >= (settings.maxLeavePerSemester * 0.8)) {
            warningMessage = "You are close to your leave limit for this semester.";
        }

        res.json({
            totalWorkingDays,
            leaveDays: totalLeaveDays,
            presentDays,
            attendancePercentage: parseFloat(attendancePercentage),
            maxLeaveLimit: settings.maxLeavePerSemester,
            warningMessage
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
