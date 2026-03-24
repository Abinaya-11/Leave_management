import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import Layout from '../components/shared/Layout';
import { 
    FaCalendarCheck, FaUserCheck, FaClock, FaPercent, 
    FaExclamationTriangle, FaChartBar, FaChartPie, FaRunning 
} from 'react-icons/fa';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const StudentAnalytics = () => {
    const [attendance, setAttendance] = useState(null);
    const [pattern, setPattern] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                console.error('Error fetching analytics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <Layout>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="loading-spinner"></div>
                    <p>Loading your analytics...</p>
                </div>
            </Layout>
        );
    }

    const pieData = attendance ? [
        { name: 'Present', value: attendance.presentDays, color: '#0284c7' },
        { name: 'Leaves', value: attendance.leaveDays, color: '#ef4444' }
    ] : [];

    const statsCards = [
        { label: 'Total Working Days', value: attendance?.totalWorkingDays, icon: <FaCalendarCheck />, color: '#0284c7' },
        { label: 'Present Days', value: attendance?.presentDays, icon: <FaUserCheck />, color: '#10b981' },
        { label: 'Leave Days', value: attendance?.leaveDays, icon: <FaRunning />, color: '#ef4444' },
        { label: 'Attendance %', value: `${attendance?.attendancePercentage}%`, icon: <FaPercent />, color: '#f59e0b' }
    ];

    return (
        <Layout>
            <div className="fade-in" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        Student Analytics Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track your attendance trends and leave patterns</p>
                </div>

                {/* Warning Section */}
                {(attendance?.warningMessage || pattern?.warningMessage) && (
                    <div style={{ 
                        background: 'rgba(245, 158, 11, 0.1)', 
                        borderLeft: '4px solid #f59e0b',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <FaExclamationTriangle style={{ color: '#f59e0b', fontSize: '1.5rem' }} />
                        <div>
                            <h4 style={{ color: '#f59e0b', margin: '0 0 4px 0' }}>Action Required / Warnings</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                {attendance?.warningMessage} {pattern?.warningMessage && ` | ${pattern.warningMessage}`}
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    {statsCards.map((card, index) => (
                        <div key={index} className="modern-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ 
                                background: `${card.color}15`, 
                                color: card.color,
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                {card.icon}
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 4px 0' }}>{card.label}</p>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>{card.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                    gap: '1.5rem' 
                }}>
                    {/* Attendance Distribution */}
                    <div className="modern-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <FaChartPie style={{ color: 'var(--primary)' }} />
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Attendance Distribution</h3>
                        </div>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Leave Statistics */}
                    <div className="modern-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <FaChartBar style={{ color: 'var(--primary)' }} />
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Leave Pattern Summary</h3>
                        </div>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Consecutive', count: pattern?.consecutiveLeaves || 0 },
                                    { name: 'Last-Min', count: pattern?.lastMinuteLeaves || 0 },
                                    { name: 'Mon/Fri', count: pattern?.mondayFridayPattern ? 1 : 0 }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                                    <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Additional Info Cards */}
                <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div className="modern-card" style={{ padding: '1.25rem', borderLeft: `4px solid ${attendance?.leaveDays > attendance?.maxLeaveLimit ? '#ef4444' : 'var(--primary)'}` }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <FaClock style={{ color: attendance?.leaveDays > attendance?.maxLeaveLimit ? '#ef4444' : 'var(--primary)' }} />
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>Leave Limit Progress</h4>
                            </div>
                            
                            <div style={{ width: '100%' }}>
                                <div style={{ width: '100%', height: '10px', background: 'var(--bg-body)', borderRadius: '5px', overflow: 'hidden', margin: '4px 0' }}>
                                    <div style={{ 
                                        width: `${Math.min(100, (attendance?.leaveDays / attendance?.maxLeaveLimit) * 100)}%`, 
                                        height: '100%', 
                                        background: attendance?.leaveDays > attendance?.maxLeaveLimit ? '#ef4444' : 'var(--primary)',
                                        transition: 'width 1s ease-in-out',
                                        borderRadius: '5px'
                                    }}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {attendance?.leaveDays} / {attendance?.maxLeaveLimit} days used this semester
                                    </span>
                                    {attendance?.leaveDays > attendance?.maxLeaveLimit && (
                                        <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>
                                            Limit Exceeded
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default StudentAnalytics;
