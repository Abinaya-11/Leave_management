import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import Layout from '../components/shared/Layout';
import GlassCard from '../components/ui/GlassCard';
import AnimatedStatsCard from '../components/ui/AnimatedStatsCard';
import Modal from '../components/ui/Modal';
import { FaUserCircle, FaCheck, FaTimes, FaFilter, FaSearch, FaHistory, FaInfoCircle, FaCalendarAlt, FaCheckCircle, FaClipboardList, FaHourglassHalf, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const FacultyDashboard = () => {
    const [leaves, setLeaves] = useState([]);
    const [filter, setFilter] = useState('All'); // 'All', 'Pending', 'Approved', 'Rejected'
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [otpInputs, setOtpInputs] = useState({});
    const { addToast } = useToast();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user?.token) {
            fetchLeaves();
        }
    }, [user, loading]);

    if (loading) {
        return (
            <Layout title="Faculty Dashboard">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout title="Faculty Dashboard">
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-main)' }}>
                    Please login to view your dashboard.
                </div>
            </Layout>
        );
    }

    const fetchLeaves = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/leaves/all', {
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
            await axios.put(`http://localhost:5000/api/leaves/${id}`, {
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

    const handleVerifyParentOtp = async (leaveId, directOtp = null) => {
        let otp = directOtp;
        if (!otp) {
            otp = window.prompt("Please enter the 6-digit OTP sent to the parent's email:");
        }
        if (!otp) return;
        if (otp.length !== 6) return addToast('OTP must be 6 digits', 'error');

        try {
            const res = await axios.post('http://localhost:5000/api/leaves/mentor/verify-parent-otp', {
                leave_id: leaveId,
                otp: otp
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (res.data.success) {
                addToast('Parent OTP verified successfully', 'success');
                setOtpInputs(prev => {
                    const next = { ...prev };
                    delete next[leaveId];
                    return next;
                });
                fetchLeaves();
                if (showModal) setShowModal(false);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Verification failed';
            addToast(msg, 'error');
            if (msg === 'Already processed') {
                fetchLeaves();
            }
        }
    };

    const filteredLeaves = filter === 'All'
        ? leaves
        : leaves.filter(leave => leave.status === filter);

    const getStatusBadge = (status) => {
        let className = 'status-badge ';
        if (status === 'Approved') className += 'status-approved';
        else if (status === 'Rejected') className += 'status-rejected';
        else if (status === 'Not Required') className += 'status-not-required';
        else className += 'status-pending';

        return <span className={className}>{status}</span>;
    };

    const openDetails = (leave) => {
        setSelectedLeave(leave);
        setShowModal(true);
    };

    const totalRequests = leaves.length;
    const pendingRequests = leaves.filter(l => l.status === 'Pending').length;
    const approvedRequests = leaves.filter(l => l.status === 'Approved').length;
    const rejectedRequests = leaves.filter(l => l.status === 'Rejected').length;

    return (
        <Layout title="Faculty Dashboard">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <AnimatedStatsCard
                    title="Total Requests"
                    value={totalRequests}
                    icon={<FaClipboardList />}
                    color="var(--primary)"
                    delay={100}
                />
                <AnimatedStatsCard
                    title="Pending"
                    value={pendingRequests}
                    icon={<FaHourglassHalf />}
                    color="var(--warning)"
                    delay={200}
                />
                <AnimatedStatsCard
                    title="Approved"
                    value={approvedRequests}
                    icon={<FaCheck />}
                    color="var(--success)"
                    delay={300}
                />
                <AnimatedStatsCard
                    title="Rejected"
                    value={rejectedRequests}
                    icon={<FaTimes />}
                    color="var(--danger)"
                    delay={400}
                />
            </div>

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

                <div className="table-container">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th style={{ textAlign: 'center' }}>Type</th>
                                <th style={{ textAlign: 'center' }}>From Date</th>
                                <th style={{ textAlign: 'center' }}>To Date</th>
                                <th style={{ textAlign: 'center' }}>Domain Approval</th>
                                <th style={{ textAlign: 'center' }}>Parent Approval</th>
                                <th style={{ textAlign: 'center' }}>Mentor/Faculty</th>
                                <th style={{ textAlign: 'center' }}>Warden</th>
                                <th style={{ textAlign: 'center' }}>Overall Status</th>
                                <th style={{ textAlign: 'center' }} colSpan="2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeaves.length === 0 ? (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No applications found for this filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredLeaves.map((leave) => (
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
                                                        {leave.studentId?.department}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ fontWeight: '500' }}>{leave.leaveType}</div>
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                                            {new Date(leave.startDate).toLocaleDateString()}
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                                            {new Date(leave.endDate).toLocaleDateString()}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {leave.domain_authority ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{leave.domain_authority}</span>
                                                    {getStatusBadge(leave.domain_approval_status || 'Pending')}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {leave.parent_status === 'Pending' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                                    {getStatusBadge('Pending')}
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <input 
                                                            type="text" 
                                                            placeholder="OTP" 
                                                            value={otpInputs[leave._id] || ''}
                                                            onChange={(e) => setOtpInputs({...otpInputs, [leave._id]: e.target.value})}
                                                            style={{ 
                                                                width: '70px', 
                                                                padding: '6px', 
                                                                borderRadius: '6px', 
                                                                border: '1px solid var(--glass-border)', 
                                                                fontSize: '0.8rem',
                                                                background: 'rgba(255,255,255,0.2)',
                                                                textAlign: 'center'
                                                            }}
                                                        />
                                                        <button 
                                                            onClick={() => handleVerifyParentOtp(leave._id, otpInputs[leave._id])}
                                                            className="btn btn-primary"
                                                            style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                                                        >Verify</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                    {leave.parent_status === 'Approved' ? (
                                                        <>
                                                            <div style={{ color: '#10b981', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <FaCheckCircle /> Approved
                                                            </div>
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                                {leave.approval_method === 'LINK' ? 'via Email' : (leave.approval_method === 'OTP_MENTOR' ? 'via Mentor OTP' : '')}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <div style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <FaTimesCircle /> Rejected by Parent
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {(() => {
                                                const isSpecial = leave.leaveType === 'SICK' || leave.leaveType === 'EMERGENCY' || leave.leaveType === 'GP';
                                                if (isSpecial) return <span style={{ color: 'var(--text-muted)' }}>-</span>;
                                                return getStatusBadge(leave.mentorStatus);
                                            })()}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {leave.wardenStatus === 'Not Required' ? <span style={{ color: 'var(--text-muted)' }}>-</span> : getStatusBadge(leave.wardenStatus)}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {getStatusBadge(leave.status)}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => openDetails(leave)}
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                            >
                                                <FaSearch size={12} style={{ marginRight: '4px' }} /> Details
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {(() => {
                                                const isMentor = leave.mentorId === user._id;
                                                const isWarden = leave.wardenId === user._id;
                                                const roleStatus = isMentor ? leave.mentorStatus : (isWarden ? leave.wardenStatus : null);

                                                if (roleStatus && roleStatus !== 'Pending') {
                                                    return getStatusBadge(roleStatus);
                                                }

                                                const isFinalized = leave.status === 'Approved' || leave.status === 'Rejected';
                                                const canAct = roleStatus === 'Pending' && !isFinalized;

                                                return (
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                        <button
                                                            className="btn btn-success"
                                                            disabled={!canAct}
                                                            onClick={() => handleAction(leave._id, 'Approved')}
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-danger"
                                                            disabled={!canAct}
                                                            onClick={() => handleAction(leave._id, 'Rejected')}
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Modal Implementation */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Leave Details"
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
                                    <p><strong>Dept:</strong> {selectedLeave.studentId?.department}</p>
                                    <p><strong>Type:</strong> {selectedLeave.student_type || selectedLeave.studentId?.student_type || 'N/A'}</p>
                                    {selectedLeave.studentId?.hostel_name && (
                                        <>
                                            <p><strong>Hostel:</strong> {selectedLeave.studentId.hostel_name}</p>
                                            <p><strong>Floor:</strong> {selectedLeave.studentId.floor}</p>
                                        </>
                                    )}
                                </div>
                            </section>

                            {/* Leave Details */}
                            <section>
                                <h4 style={{ color: 'var(--text-main)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }
                                }>
                                    <FaCalendarAlt /> Application Info
                                </h4>
                                <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--glass-border)' }}>
                                    <p><strong>Type:</strong> {selectedLeave.leaveType}</p>
                                    <p><strong>From:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()}</p>
                                    <p><strong>To:</strong> {new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                                    <p><strong>Applied:</strong> {new Date(selectedLeave.createdAt).toLocaleDateString()}</p>
                                </div>
                            </section>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <h4 style={{ color: 'var(--text-main)', marginBottom: '0.8rem' }}>Reason</h4>
                            <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '10px', fontStyle: 'italic', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}>
                                {selectedLeave.reason}
                            </div>
                        </div>

                        {/* OD Event Details */}
                        {selectedLeave.leaveType?.startsWith('ONDUTY_') && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ color: 'var(--primary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaCalendarAlt /> OD Details
                                </h4>
                                <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                                    {selectedLeave.od_details && Object.keys(selectedLeave.od_details).length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                            {Object.entries(selectedLeave.od_details).map(([key, val], idx) => {
                                                if (key.toLowerCase().includes('description')) {
                                                    return (
                                                        <div key={idx} style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                                                            <p style={{ margin: 0 }}><strong>{key}:</strong></p>
                                                            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-main)' }}>{val || 'No details provided.'}</p>
                                                        </div>
                                                    )
                                                }
                                                return (
                                                    <div key={idx}>
                                                        <p style={{ margin: 0 }}><strong>{key}:</strong> {val || '-'}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                                <p style={{ margin: 0 }}><strong>Event:</strong> {selectedLeave.event_name}</p>
                                                <p style={{ margin: 0 }}><strong>Organizer:</strong> {selectedLeave.event_organizer}</p>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                                <p style={{ margin: 0 }}><strong>Location:</strong> {selectedLeave.event_location}</p>
                                                <p style={{ margin: 0 }}><strong>Dates:</strong> {selectedLeave.event_start_date ? new Date(selectedLeave.event_start_date).toLocaleDateString() : '-'} - {selectedLeave.event_end_date ? new Date(selectedLeave.event_end_date).toLocaleDateString() : '-'}</p>
                                            </div>
                                            <p style={{ margin: 0 }}><strong>Description:</strong> {selectedLeave.event_description || 'No description provided.'}</p>
                                        </>
                                    )}
                                    {selectedLeave.proof_document && (
                                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                            <a href="#" className="btn btn-outline" style={{ display: 'inline-flex', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>View Proof</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                             <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                 <FaCheckCircle /> Approval Workflow
                             </h4>
                             {(() => {
                                 const isHosteller = (selectedLeave.student_type || selectedLeave.studentId?.student_type || '').toUpperCase() === 'HOSTELLER';
                                 const showMentor = true; 
                                 const showWarden = isHosteller; 
                                 const showDomain = !!selectedLeave.domain_authority;
                                 
                                 const columnCount = (showDomain ? 1 : 0) + 1 + (showMentor ? 1 : 0) + (showWarden ? 1 : 0) + 1;
                                 
                                 return (
                                     <div style={{ 
                                         display: 'grid', 
                                         gridTemplateColumns: `repeat(${columnCount}, 1fr)`, 
                                         gap: '1rem' 
                                     }}>
                                         {showDomain && (
                                             <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                                 <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Domain Approval</p>
                                                 <p style={{ fontSize: '0.7rem', fontWeight: '700', marginBottom: '4px', color: 'var(--primary)' }}>{selectedLeave.domain_authority}</p>
                                                 {getStatusBadge(selectedLeave.domain_approval_status || 'Pending')}
                                             </div>
                                         )}
                                         <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                             <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Parent Status</p>
                                             {selectedLeave.parent_status === 'Approved' ? (
                                                 <div style={{ color: '#10b981', fontWeight: '600', fontSize: '0.8rem' }}>
                                                     ✅ {selectedLeave.approval_method === 'LINK' ? 'Approved via Email' : 'Approved'}
                                                 </div>
                                             ) : selectedLeave.parent_status === 'Rejected' ? (
                                                 <div style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.8rem' }}>
                                                     ❌ Rejected by Parent
                                                 </div>
                                             ) : (
                                                 getStatusBadge('Pending')
                                             )}
                                         </div>
                                         {showMentor && (
                                             <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                                 <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Mentor Status</p>
                                                 {getStatusBadge(selectedLeave.mentorStatus || 'Pending')}
                                             </div>
                                         )}
                                         {showWarden && (
                                             <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                                 <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Warden Status</p>
                                                 {getStatusBadge(selectedLeave.wardenStatus || 'Pending')}
                                             </div>
                                         )}
                                         <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                             <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Overall Status</p>
                                             {getStatusBadge(selectedLeave.status || 'Pending')}
                                         </div>
                                     </div>
                                 );
                             })()}
                         </div>

                         {selectedLeave.parent_status === 'Pending' && (
                             <div style={{ 
                                 marginTop: '1.5rem', 
                                 padding: '1.5rem', 
                                 background: 'rgba(14, 165, 233, 0.05)', 
                                 borderRadius: '12px', 
                                 border: '1px dashed #0ea5e9',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 alignItems: 'center',
                                 gap: '1rem'
                             }}>
                                 <p style={{ margin: 0, fontWeight: '600', color: '#0ea5e9' }}>Verify Parent OTP</p>
                                 <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '300px' }}>
                                     <input 
                                         type="text" 
                                         placeholder="Enter 6-digit OTP" 
                                         id="parent-otp-input"
                                         style={{ 
                                             flex: 1, 
                                             padding: '0.6rem', 
                                             borderRadius: '8px', 
                                             border: '1px solid var(--glass-border)',
                                             textAlign: 'center',
                                             letterSpacing: '2px',
                                             fontWeight: '700'
                                         }} 
                                     />
                                     <button
                                         onClick={() => {
                                             const otp = document.getElementById('parent-otp-input').value;
                                             handleVerifyParentOtp(selectedLeave._id, otp);
                                         }}
                                         style={{
                                             padding: '0.6rem 1.2rem', 
                                             borderRadius: '8px', 
                                             background: '#0ea5e9', 
                                             color: 'white', 
                                             cursor: 'pointer', 
                                             fontWeight: '600', 
                                             border: 'none'
                                         }}
                                     >Verify</button>
                                 </div>
                             </div>
                         )}

                         <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                             {/* Action buttons (Approve/Reject) only show if this faculty is the current pending actor and parent has approved */}
                             {/* (Keeping existing overall layout but user wants simplifications) */}
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)',
                                    background: 'var(--input-bg)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600'
                                }}
                            >Close</button>
                        </div>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default FacultyDashboard;
