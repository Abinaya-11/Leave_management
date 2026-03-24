import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';
import Layout from '../../components/shared/Layout';
import GlassCard from '../../components/ui/GlassCard';
import { FaUserTie, FaSearch, FaBan, FaCheck, FaTrash, FaChevronDown } from 'react-icons/fa';

const AdminFaculties = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [faculty, setFaculty] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users');
            setFaculty(res.data.faculty);
        } catch (err) {
            addToast('Failed to fetch faculty', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleBlock = async (userId) => {
        try {
            const res = await axios.patch(`http://localhost:5000/api/admin/users/${userId}/block`);
            addToast(res.data.message, 'success');
            fetchFaculty();
        } catch (err) {
            addToast('Failed to update user status', 'error');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
            addToast('Faculty deleted successfully', 'success');
            fetchFaculty();
        } catch (err) {
            addToast('Failed to delete faculty', 'error');
        }
    };

    const departments = [...new Set(faculty.map(f => f.department).filter(Boolean))];

    const sortedFaculty = [...faculty].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
    );

    const filteredFaculty = sortedFaculty.filter(f => {
        const matchesSearch =
            (f.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.email || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = selectedDept === '' || f.department === selectedDept;

        return matchesSearch && matchesDept;
    });

    return (
        <Layout title="Faculty Management">
            <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>Faculty Management</h2>
                        <p style={{ color: 'var(--text-muted)' }}>View and manage faculty records</p>
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
                                placeholder="Search faculty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', paddingLeft: '3rem' }}
                            />
                            <FaSearch className="input-icon" />
                        </div>
                    </div>
                </div>

                <GlassCard style={{ padding: 0, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={tableHeaderStyle}>S.No</th>
                                <th style={tableHeaderStyle}>Faculty ID</th>
                                <th style={tableHeaderStyle}>Name</th>
                                <th style={tableHeaderStyle}>Email</th>
                                <th style={tableHeaderStyle}>Department</th>
                                <th style={tableHeaderStyle}>Designation</th>
                                <th style={tableHeaderStyle}>Status</th>
                                <th style={tableHeaderStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFaculty.map((f, index) => (
                                <tr key={f._id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row-hover">
                                    <td style={tableCellStyle}>{index + 1}</td>
                                    <td style={tableCellStyle}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{f.faculty_id || 'N/A'}</div>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{f.name}</div>
                                    </td>
                                    <td style={tableCellStyle}>{f.email}</td>
                                    <td style={tableCellStyle}>{f.department || 'N/A'}</td>
                                    <td style={tableCellStyle}>{f.designation || 'Lecturer'}</td>
                                    <td style={tableCellStyle}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: f.isBlocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: f.isBlocked ? '#ef4444' : '#10b981'
                                        }}>
                                            {f.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleToggleBlock(f._id)}
                                                style={{ ...actionBtnStyle, color: f.isBlocked ? '#10b981' : '#f59e0b' }}
                                                title={f.isBlocked ? 'Unblock' : 'Block'}
                                            >
                                                {f.isBlocked ? <FaCheck /> : <FaBan />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(f._id)}
                                                style={{ ...actionBtnStyle, color: '#ef4444' }}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredFaculty.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        {isLoading ? 'Loading faculty...' : 'No faculty found matching your search.'}
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

export default AdminFaculties;
