import React from 'react';
import AnimatedStatsCard from '../ui/AnimatedStatsCard';
import { FaCalendarCheck, FaUserCheck, FaUserTimes, FaHourglassHalf } from 'react-icons/fa';

const LeaveStats = ({ leaves }) => {
    // Mock calculation for demo purposes
    const totalWorkingDays = 100; // This would typically come from backend

    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const rejectedLeaves = leaves.filter(l => l.status === 'Rejected').length;

    // Simple calculation: Present = Total - Approved Leaves (assuming working days are fixed)
    const daysPresent = totalWorkingDays - approvedLeaves;

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
                value={approvedLeaves}
                icon={<FaUserTimes />}
                color="var(--danger)"
                delay={300}
            />
            <AnimatedStatsCard
                title="Pending Requests"
                value={pendingLeaves}
                icon={<FaHourglassHalf />}
                color="var(--warning)"
                delay={400}
            />
        </div>
    );
};

export default LeaveStats;
