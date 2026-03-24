import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import Layout from '../components/shared/Layout';
import GlassCard from '../components/ui/GlassCard';
import AnimatedStatsCard from '../components/ui/AnimatedStatsCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { FaUsers, FaUserTie, FaClipboardList, FaChartLine, FaChartPie, FaChartBar } from 'react-icons/fa';

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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && user && user.role === 'admin') {
            fetchDashboardData();
        }
    }, [user, loading]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const [statsRes, analyticsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/stats'),
                axios.get('http://localhost:5000/api/admin/analytics')
            ]);
            setStats(statsRes.data);
            setAnalytics(analyticsRes.data);
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch dashboard data', 'error');
        } finally {
            setIsLoading(false);
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

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
