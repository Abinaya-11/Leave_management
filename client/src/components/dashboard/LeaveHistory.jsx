import React from 'react';
import GlassCard from '../ui/GlassCard';
import { FaHistory } from 'react-icons/fa';

const LeaveHistory = ({ leaves }) => {
    const getStatusBadge = (status) => {
        const styles = {
            Approved: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' },
            Rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' },
            Pending: { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.2)' }
        };
        const style = styles[status] || styles.Pending;

        return (
            <span style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '600',
                backgroundColor: style.bg,
                color: style.color,
                border: style.border,
                display: 'inline-block',
                minWidth: '80px',
                textAlign: 'center'
            }}>
                {status}
            </span>
        );
    };

    return (
        <GlassCard className="fade-in" style={{ overflowX: 'auto', padding: '0' }}>
            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ padding: '0.5rem', background: 'var(--bg-body)', borderRadius: '8px', color: 'var(--primary)' }}>
                    <FaHistory />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>Leave History</h3>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-main)', opacity: 0.8, fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-main)', opacity: 0.8, fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date & Duration</th>
                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-main)', opacity: 0.8, fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</th>
                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-main)', opacity: 0.8, fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-main)', opacity: 0.8, fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remark</th>
                    </tr>
                </thead>
                <tbody>
                    {leaves.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                No leave history found.
                            </td>
                        </tr>
                    ) : (
                        leaves.map((leave, index) => (
                            <tr key={leave._id} style={{
                                borderBottom: index !== leaves.length - 1 ? '1px solid rgba(0,0,0,0.03)' : 'none',
                                transition: 'background 0.2s'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                                        {leave.leaveType}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{new Date(leave.startDate).toLocaleDateString()}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to {new Date(leave.endDate).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', maxWidth: '250px' }}>
                                    <p style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)' }}>
                                        {leave.reason}
                                    </p>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    {getStatusBadge(leave.status)}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', maxWidth: '200px' }}>
                                    {leave.adminRemark ? (
                                        <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{leave.adminRemark}</span>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>-</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </GlassCard>
    );
};

export default LeaveHistory;
