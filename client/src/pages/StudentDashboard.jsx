import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import API_URL from '../config';
import Layout from '../components/shared/Layout';
import LeaveStats from '../components/dashboard/LeaveStats';
import LeaveHistory from '../components/dashboard/LeaveHistory';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const StudentDashboard = () => {
    const { user, loading, updateUser } = useAuth();
    const { addToast } = useToast();
    const [leaves, setLeaves] = useState([]);
    
    // Parent Details Modal State
    const [showParentModal, setShowParentModal] = useState(false);
    const [parentData, setParentData] = useState({ parent_name: '', parent_email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attendance, setAttendance] = useState(null);
    const [pattern, setPattern] = useState(null);

    // Fetch leave history
    useEffect(() => {
        if (!loading && user) {
            fetchLeaves();
            fetchAnalytics();
            // Check if parent details are missing (only for students)
            if (user.role === 'student' && !user.parent_email) {
                setShowParentModal(true);
            }
        }
    }, [user, loading]);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [attendanceRes, patternRes] = await Promise.all([
                axios.get(`${API_URL}/api/leaves/attendance-summary`, config),
                axios.get(`${API_URL}/api/leaves/leave-pattern`, config)
            ]);
            setAttendance(attendanceRes.data);
            setPattern(patternRes.data);
        } catch (err) {
            console.error('Error fetching analytics for dashboard:', err);
        }
    };

    const handleParentSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/auth/update-parent-details`, parentData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                addToast('Parent details updated successfully', 'success');
                updateUser(res.data);
                setShowParentModal(false);
            }
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to update parent details', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchLeaves = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const res = await axios.get(`${API_URL}/api/leaves/student-history`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("Fetched leaves response:", res.data);
            if (res.data && res.data.success) {
                setLeaves(res.data.data || []);
            }
        } catch (err) {
            console.error("Leave history fetch error:", err);
            addToast('Failed to fetch leave history', 'error');
        }
    };

    if (loading) {
        return (
            <Layout title="Student Dashboard">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout title="Student Dashboard">
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-main)' }}>
                    Please login to view your dashboard.
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Student Dashboard">
            <div className="fade-in">
                {/* Parent Details Mandatory Popup */}
                <Modal 
                    isOpen={showParentModal} 
                    onClose={() => {}} 
                    title="Parent Details Required" 
                    preventClose={true}
                >
                    <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        To ensure security and proper notification during leave applications, please provide your parent's contact details. This information is required to continue.
                    </p>
                    <form onSubmit={handleParentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <Input 
                            label="Parent Name" 
                            placeholder="Full Name" 
                            value={parentData.parent_name}
                            onChange={(e) => setParentData({...parentData, parent_name: e.target.value})}
                            required
                        />
                        <Input 
                            label="Parent Email ID" 
                            type="email" 
                            placeholder="Email address" 
                            value={parentData.parent_email}
                            onChange={(e) => setParentData({...parentData, parent_email: e.target.value})}
                            required
                        />
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ width: '100%' }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Details'}
                        </button>
                    </form>
                </Modal>
 
                {/* Warning Banners */}
                {(attendance?.warningMessage || pattern?.warningMessage) && (
                    <div className="fade-in" style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        borderLeft: '4px solid #ef4444',
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        cursor: 'pointer'
                    }} onClick={() => window.location.href='/student-dashboard'}>
                        <div style={{ 
                            background: '#ef4444', 
                            color: 'white', 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '0.8rem'
                        }}>!</div>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                {attendance?.warningMessage || pattern?.warningMessage}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Click to view detailed analytics in your new Dashboard tab.
                            </p>
                        </div>
                    </div>
                )}

                {/* Attendance Summary Cards */}
                <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    marginBottom: '1.5rem', 
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    background: 'var(--glass-bg)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Department:</span>
                            <span style={{ 
                                background: '#3b82f620', 
                                color: '#3b82f6', 
                                padding: '0.2rem 0.6rem', 
                                borderRadius: '20px', 
                                fontSize: '0.75rem', 
                                fontWeight: '600',
                                border: '1px solid #3b82f640'
                            }}>{user.department || 'N/A'}</span>
                        </div>
                        {user.student_type?.toUpperCase() === 'HOSTELLER' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hostel:</span>
                                <span style={{ 
                                    background: '#8b5cf620', 
                                    color: '#8b5cf6', 
                                    padding: '0.2rem 0.6rem', 
                                    borderRadius: '20px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600',
                                    border: '1px solid #8b5cf640'
                                }}>{user.hostel_name} ({user.floor})</span>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Mentor</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>{user.mentor_name || 'No mentor assigned'}</span>
                        </div>
                        {user.student_type?.toUpperCase() === 'HOSTELLER' && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Warden</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>{user.warden_name || 'No warden assigned'}</span>
                            </div>
                        )}
                    </div>
                </div>

                <LeaveStats leaves={leaves} attendance={attendance} />

                {/* Leave History Table */}
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Leave History</h3>
                    <LeaveHistory leaves={leaves} />
                </div>
            </div>
        </Layout>
    );
};

export default StudentDashboard;
