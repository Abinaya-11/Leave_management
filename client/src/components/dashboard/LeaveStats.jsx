import React from 'react';
import AnimatedStatsCard from '../ui/AnimatedStatsCard';
import { FaCalendarCheck, FaUserCheck, FaUserTimes, FaHourglassHalf } from 'react-icons/fa';

const LeaveStats = ({ leaves, attendance }) => {
    // Check if we have attendance data from the backend analytics
    const hasAnalytics = attendance && typeof attendance.leaveDays === 'number';

    const totalWorkingDays = hasAnalytics ? attendance.totalWorkingDays : 100;
    
    // Sum of durations for approved leaves
    const leaveDaysTaken = hasAnalytics ? attendance.leaveDays : leaves
        .filter(l => l.status === 'Approved')
        .reduce((sum, leave) => {
            // Parse duration string like "6 Days" or calculate from dates
            if (leave.duration) {
                const dur = parseInt(leave.duration);
                return !isNaN(dur) ? sum + dur : sum + 1;
            }
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return sum + (isNaN(diff) ? 1 : diff);
        }, 0);

    const pendingLeavesCount = leaves.filter(l => l.status === 'Pending').length;

    // Days Present = Total Working Days - Total Leave Days
    const daysPresent = hasAnalytics ? attendance.presentDays : Math.max(0, totalWorkingDays - leaveDaysTaken);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <AnimatedStatsCard
                title="Total Working Days"
                value={totalWorkingDays}
                icon={<FaCalendarCheck />}
                color="var(--info)"
                delay={100}
            />
            <AnimatedStatsCard
                title="Days Present"
                value={daysPresent}
                icon={<FaUserCheck />}
                color="var(--success)"
                delay={200}
            />
            <AnimatedStatsCard
                title="Leaves Taken"
                value={leaveDaysTaken}
                icon={<FaUserTimes />}
                color="var(--danger)"
                delay={300}
            />
            <AnimatedStatsCard
                title="Pending Requests"
                value={pendingLeavesCount}
                icon={<FaHourglassHalf />}
                color="var(--warning)"
                delay={400}
            />
        </div>
    );
};

export default LeaveStats;
