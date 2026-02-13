import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';
import Layout from '../../components/shared/Layout';
import GlassCard from '../../components/ui/GlassCard';
import { FaUsers, FaSearch, FaBan, FaCheck, FaTrash } from 'react-icons/fa';

const AdminStudents = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users');
            setStudents(res.data.students);
        } catch (err) {
            addToast('Failed to fetch students', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleBlock = async (userId) => {
        try {
            const res = await axios.patch(`http://localhost:5000/api/admin/users/${userId}/block`);
            addToast(res.data.message, 'success');
            fetchStudents();
        } catch (err) {
            addToast('Failed to update user status', 'error');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
            addToast('Student deleted successfully', 'success');
            fetchStudents();
        } catch (err) {
            addToast('Failed to delete student', 'error');
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.registerNo && s.registerNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Layout title="Student Management">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }} className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>Student Management</h2>
                        <p style={{ color: 'var(--text-muted)' }}>View and manage student records</p>
                    </div>

                    <div className="input-group" style={{ maxWidth: '400px', width: '100%', marginBottom: 0 }}>
                        <FaSearch className="input-icon" />
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="Search by name, email, or register no..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                        />
                    </div>
                </div>

                <GlassCard style={{ padding: 0, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={tableHeaderStyle}>Name</th>
                                <th style={tableHeaderStyle}>Email</th>
                                <th style={tableHeaderStyle}>Reg. No</th>
                                <th style={tableHeaderStyle}>Dept & Year</th>
                                <th style={tableHeaderStyle}>Leaves</th>
                                <th style={tableHeaderStyle}>Status</th>
                                <th style={tableHeaderStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student._id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row-hover">
                                    <td style={tableCellStyle}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{student.name}</div>
                                    </td>
                                    <td style={tableCellStyle}>{student.email}</td>
                                    <td style={tableCellStyle}>{student.registerNo || 'N/A'}</td>
                                    <td style={tableCellStyle}>
                                        <div style={{ fontSize: '0.9rem' }}>{student.department}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.year ? `${student.year} Year` : 'Year N/A'}</div>
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
