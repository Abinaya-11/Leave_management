import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import API_URL from '../config';
import Layout from '../components/shared/Layout';
import GlassCard from '../components/ui/GlassCard';
import AnimatedStatsCard from '../components/ui/AnimatedStatsCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { FaUsers, FaUserTie, FaClipboardList, FaChartLine, FaChartPie, FaChartBar, FaCog, FaSave } from 'react-icons/fa';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

const AdminDashboard = () => {
    const { user, loading } = useAuth();
    const { addToast } = useToast();
    const [stats, setStats] = useState({ students: 0, faculty: 0, leaves: 0 });
    const [analytics, setAnalytics] = useState({
        leavesByDepartment: [],
        leavesByStatus: [],
        monthlyTrends: []
    });
    const [settings, setSettings] = useState({ maxLeavePerSemester: 15, totalWorkingDays: 90 });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && user && user.role === 'admin') {
            fetchDashboardData();
        }
    }, [user, loading]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const [statsRes, analyticsRes, settingsRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/stats`, config),
                axios.get(`${API_URL}/api/admin/analytics`, config),
                axios.get(`${API_URL}/api/admin/settings`, config)
            ]);
            setStats(statsRes.data);
            setAnalytics(analyticsRes.data);
            setSettings(settingsRes.data);
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch dashboard data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSettings = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const res = await axios.post(`${API_URL}/api/admin/settings`, settings, config);
            setSettings(res.data);
            addToast('System settings updated successfully', 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed to update settings', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || isLoading) {
        return (
            <Layout title="Admin Dashboard">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout title="Admin Dashboard">
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-main)' }}>
                    Please login to view your dashboard.
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Admin Dashboard">
            <div className="fade-in">
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>Leave Analytics Overview</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Real-time statistics and trends</p>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <AnimatedStatsCard
                        title="Total Students"
                        value={stats.students}
                        icon={<FaUsers />}
                        color="#6366f1"
                        delay={100}
                    />
                    <AnimatedStatsCard
                        title="Total Faculty"
                        value={stats.faculty}
                        icon={<FaUserTie />}
                        color="#ec4899"
                        delay={200}
                    />
                    <AnimatedStatsCard
                        title="Total Leave Applications"
                        value={stats.leaves}
                        icon={<FaClipboardList />}
                        color="#10b981"
                        delay={300}
                    />
                </div>

                {/* System Settings Section */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <FaCog style={{ color: 'var(--primary)', fontSize: '1.5rem' }} />
                        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>System Settings</h3>
                    </div>
                    <GlassCard style={{ padding: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Max Leaves Per Semester
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Standard: 15)</span>
                                </label>
                                <input 
                                    type="number" 
                                    className="form-control"
                                    value={settings.maxLeavePerSemester}
                                    onChange={(e) => setSettings({ ...settings, maxLeavePerSemester: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Total Working Days</label>
                                <input 
                                    type="number" 
                                    className="form-control"
                                    value={settings.totalWorkingDays}
                                    onChange={(e) => setSettings({ ...settings, totalWorkingDays: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <button 
                                className="btn btn-primary"
                                onClick={handleUpdateSettings}
                                disabled={isSaving}
                                style={{ height: '42px', width: 'fit-content', padding: '0 2rem' }}
                            >
                                <FaSave style={{ marginRight: '8px' }} />
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </GlassCard>
                </div>

                {/* Charts Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Bar Chart - Full Width */}
                    <GlassCard style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <FaChartBar style={{ color: 'var(--primary)' }} />
                            <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Leaves per Department</h3>
                        </div>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={analytics.leavesByDepartment}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="var(--text-muted)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="var(--text-muted)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--glass-bg)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            backdropFilter: 'blur(10px)',
                                            color: 'var(--text-main)'
                                        }}
                                        itemStyle={{ color: 'var(--primary)' }}
                                    />
                                    <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                        {/* Pie Chart */}
                        <GlassCard style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                                <FaChartPie style={{ color: '#ec4899' }} />
                                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Leave Status Distribution</h3>
                            </div>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={analytics.leavesByStatus}
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {analytics.leavesByStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: 'var(--glass-bg)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '12px'
                                            }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>

                        {/* Line Chart */}
                        <GlassCard style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                                <FaChartLine style={{ color: '#10b981' }} />
                                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Monthly Leave Trends</h3>
                            </div>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={analytics.monthlyTrends}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="var(--text-muted)"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="var(--text-muted)"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'var(--glass-bg)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '12px'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>

                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
