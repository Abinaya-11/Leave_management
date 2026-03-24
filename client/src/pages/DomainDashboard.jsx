import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { useToast } from '../context/ToastContext';
import Layout from '../components/shared/Layout';
import GlassCard from '../components/ui/GlassCard';
import AnimatedStatsCard from '../components/ui/AnimatedStatsCard';
import Modal from '../components/ui/Modal';
import { FaUserCircle, FaCheck, FaTimes, FaSearch, FaCalendarAlt, FaCheckCircle, FaClipboardList, FaHourglassHalf, FaMapMarkerAlt, FaBuilding, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const DomainDashboard = () => {
    const [leaves, setLeaves] = useState([]);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { addToast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        if (user?.token) {
            fetchLeaves();
        }
    }, [user]);

    const fetchLeaves = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/leaves/all`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setLeaves(res.data);
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch leave applications', 'error');
        }
    };

    const handleAction = async (id, status) => {
        const remark = prompt(`Enter remark for ${status} (Optional):`) || '';

        try {
            await axios.put(`${API_URL}/api/leaves/${id}`, {
                status,
                adminRemark: remark
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            addToast(`Leave ${status} successfully`, status === 'Approved' ? 'success' : 'info');
            fetchLeaves(); // Refresh list
            if (showModal) setShowModal(false);
        } catch (err) {
            addToast('Failed to update status', 'error');
        }
    };

    const openDetails = (leave) => {
        setSelectedLeave(leave);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        let className = 'status-badge ';
        if (status === 'Approved') className += 'status-approved';
        else if (status === 'Rejected') className += 'status-rejected';
        else className += 'status-pending';

        return <span className={className}>{status}</span>;
    };

    // Get dashboard title based on role
    const getTitle = () => {
        switch (user?.role) {
            case 'placement_cell': return 'Placement Cell Dashboard';
            case 'clubs_coordinator': return 'Clubs Coordinator Dashboard';
            case 'iecc': return 'IECC Dashboard';
            default: return 'Domain Authority Dashboard';
        }
    };

    return (
        <Layout title={getTitle()}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <AnimatedStatsCard
                    title="Pending Requests"
                    value={leaves.length}
                    icon={<FaHourglassHalf />}
                    color="var(--warning)"
                    delay={100}
                />
                <AnimatedStatsCard
                    title="Authority Role"
                    value={user?.role?.replace('_', ' ').toUpperCase()}
                    icon={<FaUserCircle />}
                    color="var(--primary)"
                    delay={200}
                />
            </div>

            <GlassCard className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Pending OD Applications</h3>
                </div>

                <div className="table-container">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th style={{ textAlign: 'center' }}>Event Name</th>
                                {user?.role === 'placement_cell' && <th style={{ textAlign: 'center' }}>Location</th>}
                                {user?.role === 'iecc' && <th style={{ textAlign: 'center' }}>Organizer</th>}
                                {user?.role === 'clubs_coordinator' && <th style={{ textAlign: 'center' }}>Event Type</th>}
                                <th style={{ textAlign: 'center' }}>Event Dates</th>
                                <th style={{ textAlign: 'center' }}>Details</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.length === 0 ? (
                                <tr>
                                    <td colSpan={user?.role === 'placement_cell' || user?.role === 'iecc' || user?.role === 'clubs_coordinator' ? 7 : 7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No pending applications found for your domain.
                                    </td>
                                </tr>
                            ) : (
                                leaves.map((leave) => (
                                    <tr key={leave._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    background: 'color-mix(in srgb, var(--primary) 15%, transparent)', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    color: 'var(--primary)', fontSize: '1.2rem'
                                                }}>
                                                    <FaUserCircle />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{leave.studentId?.name || 'Unknown'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {leave.studentId?.register_no} ({leave.studentId?.department})
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{leave.event_name || '-'}</div>
                                        </td>
                                        {user?.role === 'placement_cell' && (
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.9rem' }}><FaMapMarkerAlt size={10} style={{ marginRight: '4px' }} /> {leave.event_location || '-'}</div>
                                            </td>
                                        )}
                                        {user?.role === 'iecc' && (
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.9rem' }}>{leave.event_organizer || '-'}</div>
                                            </td>
                                        )}
                                        {user?.role === 'clubs_coordinator' && (
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.9rem' }}>{leave.leaveType?.replace('ONDUTY_', '').replace('_', ' ')}</div>
                                            </td>
                                        )}
                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'center', fontSize: '0.85rem' }}>
                                            {new Date(leave.startDate).toLocaleDateString()} -<br />
                                            {new Date(leave.endDate).toLocaleDateString()}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => openDetails(leave)}
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                            >
                                                <FaSearch size={12} style={{ marginRight: '4px' }} /> View
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => handleAction(leave._id, 'Approved')}
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                >
                                                    <FaCheck size={10} style={{ marginRight: '4px' }} /> Approve
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleAction(leave._id, 'Rejected')}
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                >
                                                    <FaTimes size={10} style={{ marginRight: '4px' }} /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="OD Leave Details"
            >
                {selectedLeave && (
                    <div style={{ color: 'var(--text-main)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                            {/* Student Info */}
                            <section>
                                <h4 style={{ color: 'var(--text-main)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaUserCircle /> Student Info
                                </h4>
                                <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--glass-border)' }}>
                                    <p><strong>Name:</strong> {selectedLeave.studentId?.name}</p>
                                    <p><strong>Register No:</strong> {selectedLeave.studentId?.register_no}</p>
                                    <p><strong>Dept:</strong> {selectedLeave.studentId?.department}</p>
                                    <p><strong>Type:</strong> {selectedLeave.student_type}</p>
                                </div>
                            </section>

                            {/* Application Info */}
                            <section>
                                <h4 style={{ color: 'var(--text-main)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaInfoCircle /> Application Info
                                </h4>
                                <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--glass-border)' }}>
                                    <p><strong>Leave Type:</strong> {selectedLeave.leaveType}</p>
                                    <p><strong>Start Date:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()}</p>
                                    <p><strong>End Date:</strong> {new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                                    <p><strong>Applied On:</strong> {new Date(selectedLeave.createdAt).toLocaleDateString()}</p>
                                </div>
                            </section>
                        </div>

                        {/* Event Details Section */}
                        {selectedLeave.leaveType?.startsWith('ONDUTY_') && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ color: 'var(--primary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaBuilding /> OD Details
                                </h4>
                                <div style={{ background: 'var(--input-bg)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    {selectedLeave.od_details && Object.keys(selectedLeave.od_details).length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            {Object.entries(selectedLeave.od_details).map(([key, val], idx) => {
                                                if (key.toLowerCase().includes('description')) {
                                                    return (
                                                        <div key={idx} style={{ gridColumn: '1 / -1' }}>
                                                            <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{key}</p>
                                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>{val || 'No details provided.'}</p>
                                                        </div>
                                                    )
                                                }
                                                return (
                                                    <div key={idx}>
                                                        <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{key}</p>
                                                        <p style={{ margin: 0, fontWeight: '600' }}>{val || '-'}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                                <div>
                                                    <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Event name</p>
                                                    <p style={{ margin: 0, fontWeight: '600' }}>{selectedLeave.event_name}</p>
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Organizer</p>
                                                    <p style={{ margin: 0, fontWeight: '600' }}>{selectedLeave.event_organizer}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                                <div>
                                                    <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location</p>
                                                    <p style={{ margin: 0, fontWeight: '600' }}>{selectedLeave.event_location}</p>
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Event dates</p>
                                                    <p style={{ margin: 0, fontWeight: '600' }}>
                                                        {selectedLeave.event_start_date ? new Date(selectedLeave.event_start_date).toLocaleDateString() : '-'} to {selectedLeave.event_end_date ? new Date(selectedLeave.event_end_date).toLocaleDateString() : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Description</p>
                                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>{selectedLeave.event_description || 'No description provided.'}</p>
                                            </div>
                                        </>
                                    )}
                                    {selectedLeave.proof_document && (
                                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Proof document</p>
                                            <a href="#" className="btn btn-outline" style={{ display: 'inline-flex', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>View Proof</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '1.5rem' }}>
                            <h4 style={{ color: 'var(--text-main)', marginBottom: '0.8rem' }}>Reason for Leave</h4>
                            <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '10px', fontStyle: 'italic', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}>
                                {selectedLeave.reason}
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)',
                                    background: 'var(--input-bg)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600'
                                }}
                            >Close</button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleAction(selectedLeave._id, 'Rejected')}
                                style={{ padding: '0.6rem 1.5rem', fontWeight: '600' }}
                            >Reject</button>
                            <button
                                className="btn btn-success"
                                onClick={() => handleAction(selectedLeave._id, 'Approved')}
                                style={{ padding: '0.6rem 1.5rem', fontWeight: '600' }}
                            >Approve Request</button>
                        </div>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default DomainDashboard;
