import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';
import API_URL from '../../config';
import Layout from '../../components/shared/Layout';
import GlassCard from '../../components/ui/GlassCard';
import { FaUsers, FaSearch, FaBan, FaCheck, FaTrash, FaChevronDown } from 'react-icons/fa';

const AdminStudents = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/admin/users`);
            setStudents(res.data.students);
        } catch (err) {
            addToast('Failed to fetch students', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleBlock = async (userId) => {
        try {
            const res = await axios.patch(`${API_URL}/api/admin/users/${userId}/block`);
            addToast(res.data.message, 'success');
            fetchStudents();
        } catch (err) {
            addToast('Failed to update user status', 'error');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            await axios.delete(`${API_URL}/api/admin/users/${userId}`);
            addToast('Student deleted successfully', 'success');
            fetchStudents();
        } catch (err) {
            addToast('Failed to delete student', 'error');
        }
    };

    const departments = [...new Set(students.map(s => s.department).filter(Boolean))];

    const sortedStudents = [...students].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
    );

    const filteredStudents = sortedStudents.filter(s => {
        const matchesSearch =
            (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.register_no || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = selectedDept === '' || s.department === selectedDept;

        return matchesSearch && matchesDept;
    });

    return (
        <Layout title="Student Management">
            <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>Student Management</h2>
                        <p style={{ color: 'var(--text-muted)' }}>View and manage student records</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div className="select-wrapper" style={{ minWidth: '180px' }}>
                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="glass-input"
                                style={{ padding: '0.6rem 2.5rem 0.6rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }}
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept, index) => (
                                    <option key={index} value={dept} style={{ background: '#1a1a2e', color: 'white' }}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                            <FaChevronDown className="select-arrow" style={{ right: '1rem' }} />
                        </div>

                        <div className="input-field-container" style={{ maxWidth: '350px', marginBottom: 0 }}>
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', paddingLeft: '3rem' }}
                            />
                            <FaSearch className="input-icon" />
                        </div>
                    </div>
                </div>

                <GlassCard style={{ padding: 0, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1300px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={tableHeaderStyle}>S.No</th>
                                <th style={tableHeaderStyle}>Name</th>
                                <th style={tableHeaderStyle}>Register No</th>
                                <th style={tableHeaderStyle}>Email</th>
                                <th style={tableHeaderStyle}>Dept & Year</th>
                                <th style={tableHeaderStyle}>Type</th>
                                <th style={tableHeaderStyle}>Hostel Name</th>
                                <th style={tableHeaderStyle}>Floor</th>
                                <th style={tableHeaderStyle}>Room No</th>
                                <th style={tableHeaderStyle}>Mentor Name</th>
                                <th style={tableHeaderStyle}>Hostel Warden Name</th>
                                <th style={tableHeaderStyle}>Parent Name</th>
                                <th style={tableHeaderStyle}>Parent Email</th>
                                <th style={tableHeaderStyle}>Leaves</th>
                                <th style={tableHeaderStyle}>Status</th>
                                <th style={tableHeaderStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => (
                                <tr key={student._id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row-hover">
                                    <td style={tableCellStyle}>{index + 1}</td>
                                    <td style={tableCellStyle}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{student.name}</div>
                                    </td>
                                    <td style={tableCellStyle}>{student.register_no}</td>
                                    <td style={tableCellStyle}>{student.email}</td>
                                    <td style={tableCellStyle}>
                                        <div style={{ fontSize: '0.9rem' }}>{student.department}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.year ? `${student.year} Year` : 'Year N/A'}</div>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: student.student_type === 'Hosteller' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: student.student_type === 'Hosteller' ? '#3b82f6' : '#10b981'
                                        }}>
                                            {student.student_type || '-'}
                                        </span>
                                    </td>
                                    <td style={tableCellStyle}>
                                        {student.student_type === 'Hosteller' ? student.hostel_name : '-'}
                                    </td>
                                    <td style={tableCellStyle}>
                                        {student.student_type === 'Hosteller' ? student.floor : '-'}
                                    </td>
                                    <td style={tableCellStyle}>
                                        {student.student_type === 'Hosteller' ? student.room_no : '-'}
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div
                                            title={student.mentor?.name || 'Not Assigned'}
                                            style={{
                                                maxWidth: '120px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontWeight: student.mentor?.name ? '500' : 'normal',
                                                color: student.mentor?.name ? 'var(--text-main)' : 'var(--text-muted)'
                                            }}
                                        >
                                            {student.mentor?.name || 'Not Assigned'}
                                        </div>
                                    </td>
                                    <td style={tableCellStyle}>
                                        {student.student_type === 'Dayscholar' ? (
                                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                                        ) : (
                                            <div
                                                title={student.warden?.name || 'Not Assigned'}
                                                style={{
                                                    maxWidth: '120px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    fontWeight: student.warden?.name ? '500' : 'normal',
                                                    color: student.warden?.name ? 'var(--text-main)' : 'var(--text-muted)'
                                                }}
                                            >
                                                {student.warden?.name || 'Not Assigned'}
                                            </div>
                                        )}
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div
                                            title={student.parent_name || '-'}
                                            style={{
                                                maxWidth: '120px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontWeight: student.parent_name ? '500' : 'normal',
                                                color: student.parent_name ? 'var(--text-main)' : 'var(--text-muted)'
                                            }}
                                        >
                                            {student.parent_name || '-'}
                                        </div>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div style={{ color: student.parent_email ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                            {student.parent_email || '-'}
                                        </div>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                                            {student.leaveCount}
                                        </span>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: student.isBlocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: student.isBlocked ? '#ef4444' : '#10b981'
                                        }}>
                                            {student.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleToggleBlock(student._id)}
                                                style={{ ...actionBtnStyle, color: student.isBlocked ? '#10b981' : '#f59e0b' }}
                                                title={student.isBlocked ? 'Unblock' : 'Block'}
                                            >
                                                {student.isBlocked ? <FaCheck /> : <FaBan />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(student._id)}
                                                style={{ ...actionBtnStyle, color: '#ef4444' }}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        {isLoading ? 'Loading students...' : 'No students found matching your search.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </GlassCard>
            </div>
        </Layout>
    );
};

const tableHeaderStyle = {
    padding: '1rem 1.5rem',
    textAlign: 'left',
    color: 'var(--text-main)',
    opacity: 0.8,
    fontWeight: '600',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const tableCellStyle = {
    padding: '1.25rem 1.5rem',
    color: 'var(--text-main)',
    fontSize: '0.95rem'
};

const actionBtnStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem',
    borderRadius: '8px',
    transition: 'background 0.2s',
    backgroundColor: 'rgba(0,0,0,0.03)'
};

export default AdminStudents;
