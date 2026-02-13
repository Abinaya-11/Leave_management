import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import Layout from '../components/shared/Layout';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { FaUserCircle, FaCheck, FaTimes, FaFilter, FaSearch } from 'react-icons/fa';

const FacultyDashboard = () => {
    const [leaves, setLeaves] = useState([]);
    const [filter, setFilter] = useState('Pending'); // 'All', 'Pending', 'Approved', 'Rejected'
    const { addToast } = useToast();

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/leaves/all');
            setLeaves(res.data);
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch leave applications', 'error');
        }
    };

    const handleAction = async (id, status) => {
        const remark = prompt(`Enter remark for ${status} (Optional):`) || '';

        try {
            await axios.put(`http://localhost:5000/api/leaves/${id}`, {
                status,
                adminRemark: remark
            });
            addToast(`Leave ${status} successfully`, status === 'Approved' ? 'success' : 'info');
            fetchLeaves(); // Refresh list
        } catch (err) {
            addToast('Failed to update status', 'error');
        }
    };

    const filteredLeaves = filter === 'All'
        ? leaves
        : leaves.filter(leave => leave.status === filter);

    const getStatusBadge = (status) => {
        const styles = {
            Approved: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
            Rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
            Pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }
        };
        const style = styles[status] || styles.Pending;

        return (
            <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: '600',
                backgroundColor: style.bg,
                color: style.color
            }}>
                {status}
            </span>
        );
    };

    return (
        <Layout title="Faculty Dashboard">
            <GlassCard className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Leave Applications</h3>

                    <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.4)', padding: '0.3rem', borderRadius: '10px' }}>
                        {['All', 'Pending', 'Approved', 'Rejected'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    border: 'none',
                                    background: filter === f ? 'white' : 'transparent',
                                    color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    boxShadow: filter === f ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.8rem' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'left' }}>
                                <th style={{ padding: '0 1rem' }}>Student</th>
                                <th style={{ padding: '0 1rem' }}>Leave Details</th>
                                <th style={{ padding: '0 1rem' }}>Period</th>
                                <th style={{ padding: '0 1rem' }}>Status</th>
                                <th style={{ padding: '0 1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeaves.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No applications found for this filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredLeaves.map((leave) => (
                                    <tr key={leave._id} style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '12px' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    background: 'var(--gradient-bg)', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    color: 'var(--primary)', fontSize: '1.2rem'
                                                }}>
                                                    <FaUserCircle />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{leave.studentId?.name || 'Unknown'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{leave.studentId?.department || 'Student'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '500', marginBottom: '0.2rem' }}>{leave.leaveType}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                                                {leave.reason}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.9rem' }}>
                                                {new Date(leave.startDate).toLocaleDateString()}
                                                <br />
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    to {new Date(leave.endDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {getStatusBadge(leave.status)}
                                            {leave.adminRemark && (
                                                <div style={{ fontSize: '0.75rem', marginTop: '0.3rem', color: 'var(--text-muted)' }}>
                                                    Note: {leave.adminRemark}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            {leave.status === 'Pending' ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => handleAction(leave._id, 'Approved')}
                                                        title="Approve"
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                                                            background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(leave._id, 'Rejected')}
                                                        title="Reject"
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                                                            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ opacity: 0.5, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    Processed
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </Layout>
    );
};

export default FacultyDashboard;
