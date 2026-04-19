import React from 'react';
import GlassCard from '../ui/GlassCard';
import { FaHistory, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt } from 'react-icons/fa';
import Modal from '../ui/Modal';

const LeaveHistory = ({ leaves }) => {
    const [selectedLeave, setSelectedLeave] = React.useState(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const openLeaveModal = (leave) => {
        setSelectedLeave(leave);
        setIsModalOpen(true);
    };

    const calculateDuration = (from, to) => {
        const start = new Date(from);
        const end = new Date(to);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
    };

    const getReasonBadge = (reason) => {
        const reasonLower = reason?.toLowerCase() || '';
        let config = { bg: 'rgba(156, 163, 175, 0.1)', color: '#6b7280', border: '1px solid rgba(156, 163, 175, 0.2)' }; // Default Gray

        if (reasonLower.includes('medical') || reasonLower.includes('sick')) {
            config = { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }; // Red
        } else if (reasonLower.includes('personal') || reasonLower.includes('family')) {
            config = { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }; // Blue
        } else if (reasonLower.includes('event') || reasonLower.includes('competition') || reasonLower.includes('on duty')) {
            config = { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.2)' }; // Purple
        }

        return (
            <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: config.bg,
                color: config.color,
                border: config.border,
                display: 'inline-block',
                textTransform: 'capitalize'
            }}>
                {reason}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        let className = 'status-badge ';
        if (status === 'Approved') className += 'status-approved';
        else if (status === 'Rejected') className += 'status-rejected';
        else if (status === 'Not Required') className += 'status-not-required';
        else className += 'status-pending';

        return <span className={className}>{status}</span>;
    };

    return (
        <GlassCard className="fade-in" style={{ overflowX: 'auto', padding: '0' }}>
            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ padding: '0.5rem', background: 'var(--bg-body)', borderRadius: '8px', color: 'var(--primary)' }}>
                    <FaHistory />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>Leave History</h3>
            </div>

            <div className="table-container">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Leave Type</th>
                            <th>From Date</th>
                            <th>To Date</th>
                            <th>Duration</th>
                            <th>Reason</th>
                            <th>Parent Status</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No leave history found.
                                </td>
                            </tr>
                        ) : (
                            leaves.map((leave) => (
                                <tr key={leave._id}>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>
                                            {leave.leave_type}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: '500' }}>{new Date(leave.from_date).toLocaleDateString()}</span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: '500' }}>{new Date(leave.to_date).toLocaleDateString()}</span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: '500' }}>
                                            {calculateDuration(leave.from_date, leave.to_date)}
                                        </span>
                                    </td>
                                    <td>
                                        {getReasonBadge(leave.reason)}
                                    </td>
                                    <td>
                                        {getStatusBadge(leave.parent_status || 'Pending')}
                                    </td>
                                    <td>
                                        {getStatusBadge(leave.overall_status || leave.status)}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => openLeaveModal(leave)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Leave Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Leave Details - ${selectedLeave?.leave_type || selectedLeave?.leaveType}`}
            >
                {selectedLeave && (
                    <div className="leave-details-container">
                        <section style={{ marginBottom: '2rem' }}>
                            <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                <FaInfoCircle style={{ color: 'var(--primary)' }} /> Leave Information
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <DetailItem label="Leave Type" value={selectedLeave.leave_type || selectedLeave.leaveType} />
                                <DetailItem label="From Date" value={new Date(selectedLeave.from_date || selectedLeave.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' })} />
                                <DetailItem label="To Date" value={new Date(selectedLeave.to_date || selectedLeave.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' })} />
                                <DetailItem label="Duration" value={calculateDuration(selectedLeave.from_date || selectedLeave.startDate, selectedLeave.to_date || selectedLeave.endDate)} />
                                <DetailItem label="Status" value={getStatusBadge(selectedLeave.overall_status || selectedLeave.status)} />
                                <DetailItem label="Applied Date" value={new Date(selectedLeave.created_at || selectedLeave.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })} />
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Reason</span>
                                <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}>{selectedLeave.reason}</p>
                            </div>
                        </section>

                        {/* OD Event Details */}
                        {(selectedLeave.leave_type?.startsWith('ONDUTY_') || selectedLeave.leaveType?.startsWith('ONDUTY_')) && (
                            <section style={{ marginBottom: '2rem' }}>
                                <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                    <FaCalendarAlt style={{ color: 'var(--primary)' }} /> OD Details
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
                                        <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)' }}>
                                            <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>View Proof Document</a>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        <section>
                            <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                <FaCheckCircle style={{ color: 'var(--primary)' }} /> Approval Workflow
                            </h4>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                                gap: '1rem' 
                            }}>
                                {selectedLeave.domain_authority && (
                                    <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Domain Approval</p>
                                        <p style={{ fontSize: '0.7rem', fontWeight: '700', marginBottom: '4px', color: 'var(--primary)' }}>{selectedLeave.domain_authority}</p>
                                        {getStatusBadge(selectedLeave.domain_approval_status || 'Pending')}
                                        {selectedLeave.domain_approval_status === 'Approved' && (
                                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {`Approved by: ${selectedLeave.domain_approved_by || 'Authority'}`}
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Parent Status</p>
                                    {getStatusBadge(selectedLeave.parent_status || 'Pending')}
                                </div>
                                {((selectedLeave.leave_type || selectedLeave.leaveType) !== 'SICK' && (selectedLeave.leave_type || selectedLeave.leaveType) !== 'EMERGENCY' && (selectedLeave.leave_type || selectedLeave.leaveType) !== 'GP') && (
                                    <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Mentor Status</p>
                                        {getStatusBadge(selectedLeave.mentor_status || selectedLeave.mentorStatus)}
                                        {(selectedLeave.mentor_status || selectedLeave.mentorStatus) === 'Approved' && (
                                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {(() => {
                                                    const approverInfo = selectedLeave.approvalStatus?.find(s => s.role.includes('Mentor'));
                                                    return `Approved by: ${approverInfo?.facultyName || 'Mentor'} ${approverInfo?.facultyDepartment ? `(${approverInfo.facultyDepartment})` : ''}`;
                                                })()}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {(selectedLeave.student_type?.toUpperCase() !== 'DAYSCHOLAR') && (
                                    <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Warden Status</p>
                                        {getStatusBadge(selectedLeave.warden_status || selectedLeave.wardenStatus)}
                                        {(selectedLeave.warden_status || selectedLeave.wardenStatus) === 'Approved' && (
                                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {(() => {
                                                    const wardenInfo = selectedLeave.approvalStatus?.find(s => s.role.includes('Warden'));
                                                    return `Approved by: ${wardenInfo?.facultyName || 'Warden'} ${wardenInfo?.facultyDepartment ? `(${wardenInfo.facultyDepartment})` : ''}`;
                                                })()}
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Overall Status</p>
                                    {getStatusBadge(selectedLeave.overall_status || selectedLeave.status)}
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </Modal>
        </GlassCard>
    );
};

/* Helper Components */
const DetailItem = ({ label, value }) => (
    <div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>{label}</span>
        <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>{value}</span>
    </div>
);

const ApprovalCard = ({ step, getStatusBadge }) => (
    <div style={{
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.4)',
        borderRadius: '12px',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{step.role}</span>
            {getStatusBadge(step.status)}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <div>{step.facultyId} - {step.facultyName}</div>
            <div style={{ marginTop: '0.25rem' }}>
                <span style={{ opacity: 0.8 }}>Approved by:</span> <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{step.approvedBy || '-'}</span>
            </div>
        </div>
    </div>
);

export default LeaveHistory;
