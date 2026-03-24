import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/shared/Layout';
import GlassCard from '../../components/ui/GlassCard';
import Modal from '../../components/ui/Modal';
import {
    FaUserCircle, FaSearch, FaFilter, FaCalendarAlt,
    FaCheckCircle, FaEraser, FaUserTie, FaBuilding
} from 'react-icons/fa';

const AdminLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [faculty, setFaculty] = useState([]);

    // Filters
    const [filters, setFilters] = useState({
        department: '',
        mentor: '',
        warden: '',
        date: '',
        leaveType: ''
    });

    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { addToast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        if (user?.token) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const [leavesRes, deptsRes, usersRes] = await Promise.all([
                axios.get(`${API_URL}/api/leaves/all`, config),
                axios.get(`${API_URL}/api/admin/departments`, config),
                axios.get(`${API_URL}/api/admin/users`, config)
            ]);

            setLeaves(leavesRes.data);
            setDepartments(deptsRes.data);
            setFaculty(usersRes.data.faculty || []);
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch leave requests', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const resetFilters = () => {
        setFilters({
            department: '',
            mentor: '',
            warden: '',
            date: '',
            leaveType: ''
        });
    };

    const filteredLeaves = leaves.filter(leave => {
        const student = leave.studentId || {};
        const matchDept = !filters.department || student.department === filters.department;
        const matchMentor = !filters.mentor || leave.mentorId === filters.mentor;
        const matchWarden = !filters.warden || leave.wardenId === filters.warden;
        const matchType = !filters.leaveType || leave.leaveType === filters.leaveType;

        let matchDate = true;
        if (filters.date) {
            const leaveStart = new Date(leave.startDate).setHours(0, 0, 0, 0);
            const leaveEnd = new Date(leave.endDate).setHours(0, 0, 0, 0);
            const filterDate = new Date(filters.date).setHours(0, 0, 0, 0);
            matchDate = filterDate >= leaveStart && filterDate <= leaveEnd;
        }

        return matchDept && matchMentor && matchWarden && matchType && matchDate;
    });

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

    const leaveTypes = [
        "ONDUTY_EVENTS", "ONDUTY_PROJECT_COMP", "ONDUTY_INTERNSHIP",
        "ONDUTY_PAPER_PRESENTATION", "ONDUTY_TECH_COMP", "ONDUTY_NSS_NCC",
        "ONDUTY_SPORTS", "ONDUTY_NPTEL", "ONDUTY_OFFCAMPUS", "ONDUTY_TRAINING",
        "ONDUTY_GOVT_EXAM", "ONDUTY_CLUBS", "SP", "GP", "SICK", "EMERGENCY", "GENERAL_LEAVE"
    ];

    return (
        <Layout title="Leave Requests">
            <div className="fade-in">
                {/* Filters Section */}
                <GlassCard style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        <FaFilter />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Filter Leave Requests</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="filter-group">
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Department</label>
                            <select name="department" value={filters.department} onChange={handleFilterChange} className="modern-input" style={{ width: '100%', fontSize: '0.9rem' }}>
                                <option value="">All Departments</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Mentor</label>
                            <select name="mentor" value={filters.mentor} onChange={handleFilterChange} className="modern-input" style={{ width: '100%', fontSize: '0.9rem' }}>
                                <option value="">All Mentors</option>
                                {faculty.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Warden</label>
                            <select name="warden" value={filters.warden} onChange={handleFilterChange} className="modern-input" style={{ width: '100%', fontSize: '0.9rem' }}>
                                <option value="">All Wardens</option>
                                {faculty.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Date</label>
                            <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="modern-input" style={{ width: '100%', fontSize: '0.9rem' }} />
                        </div>
                        <div className="filter-group">
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Leave Type</label>
                            <select name="leaveType" value={filters.leaveType} onChange={handleFilterChange} className="modern-input" style={{ width: '100%', fontSize: '0.9rem' }}>
                                <option value="">All Types</option>
                                {leaveTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="filter-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button onClick={resetFilters} style={{
                                width: '100%',
                                padding: '0.65rem',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.2)',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            >
                                <FaEraser size={14} /> Reset
                            </button>
                        </div>
                    </div>
                </GlassCard>

                {/* Table Section */}
                <GlassCard style={{ padding: '0' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'left' }}>
                                    <th style={{ padding: '1.25rem 1rem' }}>Student Name</th>
                                    <th style={{ padding: '1.25rem 1rem' }}>Register No</th>
                                    <th style={{ padding: '1.25rem 1rem' }}>Dept</th>
                                    <th style={{ padding: '1.25rem 1rem' }}>Type</th>
                                    <th style={{ padding: '1.25rem 1rem' }}>Leave Type</th>
                                    <th style={{ padding: '1.25rem 1rem' }}>From</th>
                                    <th style={{ padding: '1.25rem 1rem' }}>To</th>
                                    <th style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>Parent</th>
                                    <th style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>Mentor</th>
                                    <th style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>Warden</th>
                                    <th style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>Overall</th>
                                    <th style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="12" style={{ textAlign: 'center', padding: '4rem' }}>
                                            <div className="spinner" style={{ margin: '0 auto' }}></div>
                                        </td>
                                    </tr>
                                ) : filteredLeaves.length === 0 ? (
                                    <tr>
                                        <td colSpan="12" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                            No leave requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeaves.map((leave) => (
                                        <tr key={leave._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }} className="table-row-hover">
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{leave.studentId?.name || 'Unknown'}</div>
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {leave.studentId?.register_no || leave.studentId?.registerNo || 'N/A'}
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {leave.studentId?.department}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    background: 'rgba(255,255,255,0.2)',
                                                    color: 'var(--text-main)',
                                                    fontWeight: '500'
                                                }}>
                                                    {leave.student_type || 'Day Scholar'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '500' }}>
                                                {leave.leaveType}
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                {new Date(leave.startDate).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                {new Date(leave.endDate).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {getStatusBadge(leave.parent_status || 'Pending')}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {(() => {
                                                    const isSpecial = leave.leaveType === 'SICK' || leave.leaveType === 'EMERGENCY' || leave.leaveType === 'GP';
                                                    if (isSpecial) return <span style={{ color: 'var(--text-muted)' }}>-</span>;
                                                    return getStatusBadge(leave.mentorStatus);
                                                })()}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {getStatusBadge(leave.wardenStatus)}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {getStatusBadge(leave.status)}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => openDetails(leave)}
                                                    style={{
                                                        background: 'var(--primary-light)',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.3rem',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    <FaSearch size={10} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>

            {/* Modal for Details */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Leave Request Details">
                {selectedLeave && (
                    <div style={{ color: 'var(--text-main)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            {/* Student Section */}
                            <section>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                    <FaUserCircle /> Student Details
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                                    <p><strong>Name:</strong> {selectedLeave.studentId?.name}</p>
                                    <p><strong>Register No:</strong> {selectedLeave.studentId?.register_no || selectedLeave.studentId?.registerNo}</p>
                                    <p><strong>Dept:</strong> {selectedLeave.studentId?.department}</p>
                                    <p><strong>Type:</strong> {selectedLeave.student_type}</p>
                                    {selectedLeave.studentId?.hostel_name && (
                                        <>
                                            <p><strong>Hostel:</strong> {selectedLeave.studentId.hostel_name}</p>
                                            <p><strong>Floor:</strong> {selectedLeave.studentId.floor}</p>
                                        </>
                                    )}
                                </div>
                            </section>

                            {/* Leave Section */}
                            <section>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                    <FaCalendarAlt /> Leave Information
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                                    <p><strong>Type:</strong> {selectedLeave.leaveType}</p>
                                    <p><strong>Duration:</strong> {selectedLeave.duration} ({selectedLeave.period})</p>
                                    <p><strong>From:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} {selectedLeave.startTime}</p>
                                    <p><strong>To:</strong> {new Date(selectedLeave.endDate).toLocaleDateString()} {selectedLeave.endTime}</p>
                                    <p><strong>Applied On:</strong> {new Date(selectedLeave.createdAt).toLocaleString()}</p>
                                </div>
                            </section>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Reason</h4>
                            <div style={{
                                background: 'rgba(255,255,255,0.2)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)',
                                fontStyle: 'italic',
                                lineHeight: '1.6'
                            }}>
                                {selectedLeave.reason}
                            </div>
                        </div>

                        <div style={{ marginTop: '2.5rem' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <FaCheckCircle /> Approval Status
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${((selectedLeave.leaveType === 'SICK' || selectedLeave.leaveType === 'EMERGENCY' || selectedLeave.leaveType === 'GP') || selectedLeave.student_type?.toUpperCase() === 'DAYSCHOLAR') ? 3 : 4}, 1fr)`, gap: '1.5rem' }}>
                                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Parent Status</p>
                                    {getStatusBadge(selectedLeave.parent_status || 'Pending')}
                                </div>
                                {(selectedLeave.leaveType !== 'SICK' && selectedLeave.leaveType !== 'EMERGENCY' && selectedLeave.leaveType !== 'GP') && (
                                    <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Mentor Status</p>
                                        {getStatusBadge(selectedLeave.mentorStatus)}
                                        {selectedLeave.mentorStatus === 'Approved' && (
                                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {(() => {
                                                    const mentorInfo = selectedLeave.approvalStatus?.find(s => s.role.includes('Mentor'));
                                                    return `Approved by: ${mentorInfo?.facultyName || 'Mentor'} ${mentorInfo?.facultyDepartment ? `(${mentorInfo.facultyDepartment})` : ''}`;
                                                })()}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {(selectedLeave.student_type?.toUpperCase() !== 'DAYSCHOLAR') && (
                                    <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Warden Status</p>
                                        {getStatusBadge(selectedLeave.wardenStatus)}
                                        {selectedLeave.wardenStatus === 'Approved' && (
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
                                    {getStatusBadge(selectedLeave.status)}
                                </div>
                            </div>
                        </div>

                        {selectedLeave.adminRemark && (
                            <div style={{ marginTop: '2rem' }}>
                                <h4 style={{ marginBottom: '1rem' }}>Faculty Remark</h4>
                                <p style={{ color: 'var(--text-muted)' }}>{selectedLeave.adminRemark}</p>
                            </div>
                        )}

                        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    padding: '0.75rem 2rem',
                                    borderRadius: '10px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass-bg)',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    fontWeight: '700'
                                }}
                            >Close</button>
                        </div>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default AdminLeaves;
