import React from 'react';
import GlassCard from '../ui/GlassCard';
import { FaCalendarCheck, FaUserCheck, FaUserTimes, FaHourglassHalf } from 'react-icons/fa';

const StatCard = ({ title, value, icon, color, bg }) => (
    <GlassCard className="fade-in" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '1.5rem',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'default'
    }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: bg || `${color}15`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: color,
            fontSize: '1.5rem',
            boxShadow: `0 4px 10px ${color}15`
        }}>
            {icon}
        </div>
        <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>{title}</h4>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>{value}</div>
        </div>
    </GlassCard>
);

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
            <StatCard
                title="Total Working Days"
                value={totalWorkingDays}
                icon={<FaCalendarCheck />}
                color="var(--info)"
                bg="rgba(59, 130, 246, 0.1)"
            />
            <StatCard
                title="Days Present"
                value={daysPresent}
                icon={<FaUserCheck />}
                color="var(--success)"
                bg="rgba(16, 185, 129, 0.1)"
            />
            <StatCard
                title="Leaves Taken"
                value={approvedLeaves}
                icon={<FaUserTimes />}
                color="var(--danger)"
                bg="rgba(239, 68, 68, 0.1)"
            />
            <StatCard
                title="Pending Requests"
                value={pendingLeaves}
                icon={<FaHourglassHalf />}
                color="var(--warning)"
                bg="rgba(245, 158, 11, 0.1)"
            />
        </div>
    );
};

export default LeaveStats;
