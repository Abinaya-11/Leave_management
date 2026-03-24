import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBan, FaSearch, FaUnlockAlt, FaFilter, FaSpinner } from 'react-icons/fa';
import Layout from '../components/shared/Layout';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import API_URL from '../config';

const LeaveBlockPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [department, setDepartment] = useState('');
    const [year, setYear] = useState('');
    const [unblockingId, setUnblockingId] = useState(null);
    const { addToast } = useToast();

    const fetchBlockedStudents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/leave-block/students`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search, department, year }
            });
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching blocked students:', error);
            addToast('Failed to fetch blocked students.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlockedStudents();
    }, [search, department, year]);

    const handleUnblock = async (studentId, studentName) => {
        if (!window.confirm(`Are you sure you want to unblock ${studentName}?`)) return;

        try {
            setUnblockingId(studentId);
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/unblock-student/${studentId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                addToast(res.data.message, 'success');
                // Remove the unblocked student from the local state
                setStudents(students.filter(s => s._id !== studentId));
            }
        } catch (error) {
            console.error('Error unblocking student:', error);
            addToast(error.response?.data?.message || 'Failed to unblock student.', 'error');
        } finally {
            setUnblockingId(null);
        }
    };

    return (
        <Layout title="Leave Block Management">
            <div className="fade-in" style={{ padding: '1rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                <GlassCard style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                        <FaBan style={{ color: '#ef4444', fontSize: '1.75rem' }} />
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>Leave Block Management</h2>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage users whose leave capabilities have been automatically restricted.</p>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <Input
                            placeholder="Search by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<FaSearch />}
                            className="modern-input"
                        />
                        <div className="searchable-dropdown-container">
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="modern-input searchable-select"
                                style={{ width: '100%', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                            >
                                <option value="">All Departments</option>
                                <option value="CSE">CSE</option>
                                <option value="IT">IT</option>
                                <option value="ECE">ECE</option>
                                <option value="EEE">EEE</option>
                                <option value="MECH">MECH</option>
                                <option value="CIVIL">CIVIL</option>
                                <option value="AIDS">AIDS</option>
                                <option value="AIML">AIML</option>
                            </select>
                        </div>
                        <div className="searchable-dropdown-container">
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="modern-input searchable-select"
                                style={{ width: '100%', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                            >
                                <option value="">All Years</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
                    </div>

                    {/* Content Section */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                            <FaSpinner className="spinner" style={{ fontSize: '2rem', marginBottom: '1rem' }} />
                            <p>Loading blocked students...</p>
                        </div>
                    ) : students.length > 0 ? (
                        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-card)', borderBottom: '2px solid var(--glass-border)' }}>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>Student</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>Register No.</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>Department</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'center' }}>Year</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'center' }}>Total Leave</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'center' }}>Blocked Reason</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{
                                                        width: '40px', height: '40px', borderRadius: '50%',
                                                        background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 'bold', flexShrink: 0
                                                    }}>
                                                        {student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{student.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{student.register_no || student.registerNo || 'N/A'}</td>
                                            <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{student.department}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-main)' }}>{student.year || '-'}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-main)', fontWeight: 'bold' }}>{student.totalLeaveTaken || 0} Days</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    color: '#ef4444',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                                }}>
                                                    {student.leaveBlockedReason || 'Limit Exceeded'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <Button
                                                    variant="outline"
                                                    disabled={unblockingId === student._id}
                                                    onClick={() => handleUnblock(student._id, student.name)}
                                                    className="mobile-full-width"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                                                >
                                                    {unblockingId === student._id ? <FaSpinner className="spinner" /> : <FaUnlockAlt />}
                                                    Unblock
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <FaUnlockAlt style={{ fontSize: '2rem', color: '#10b981' }} />
                            </div>
                            <h3 style={{ color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>No Blocked Students</h3>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Everyone is free to apply for leaves within their limits.</p>
                        </div>
                    )}
                </GlassCard>
            </div>
        </Layout>
    );
};

export default LeaveBlockPage;
