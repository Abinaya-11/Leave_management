import React, { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import Layout from '../components/shared/Layout'; // Assuming standard Layout exists
import GlassCard from '../components/ui/GlassCard'; // Assuming standard GlassCard exists
import { FaBell, FaCheckDouble, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

const NotificationPage = () => {
    const { notifications, markAllAsRead, fetchNotifications } = useNotification();

    useEffect(() => {
        fetchNotifications();
        // Mark all as read when opening the page
        markAllAsRead();
    }, []); // Run once on mount

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getIcon = (type, message = '') => {
        const msg = message.toLowerCase();
        if (msg.includes('approved')) return <FaCheckDouble style={{ color: 'var(--success, #10b981)' }} />;
        if (msg.includes('rejected')) return <FaExclamationCircle style={{ color: 'var(--danger, #ef4444)' }} />;
        if (type === 'LEAVE_REQUEST' || msg.includes('request')) return <FaInfoCircle style={{ color: 'var(--info, #3b82f6)' }} />;
        if (msg.includes('remind')) return <FaBell style={{ color: 'var(--warning, #f59e0b)' }} />;

        switch (type) {
            case 'LEAVE_REQUEST': return <FaInfoCircle style={{ color: 'var(--info, #3b82f6)' }} />;
            case 'LEAVE_STATUS_UPDATE': return <FaCheckDouble style={{ color: 'var(--success, #10b981)' }} />;
            default: return <FaBell style={{ color: 'var(--text-muted)' }} />;
        }
    };

    return (
        <Layout title="Notifications">
            <div className="fade-in" style={{ width: '100%', maxWidth: '1150px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FaBell style={{ color: 'var(--primary)', fontSize: '1.4rem' }} />
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>Your Notifications</h2>
                    </div>
                    <button onClick={markAllAsRead} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'transparent', border: '1px solid var(--border-light)',
                        color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem',
                        padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                        transition: 'var(--transition-smooth)'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--primary)';
                            e.currentTarget.style.borderColor = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.borderColor = 'var(--border-light)';
                        }}>
                        <FaCheckDouble /> Mark all as read
                    </button>
                </div>

                {notifications.length === 0 ? (
                    <GlassCard style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <FaBell style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No notifications yet.</p>
                    </GlassCard>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                style={{
                                    padding: '16px 20px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-card)',
                                    boxShadow: 'var(--shadow-sm)',
                                    borderLeft: `4px solid ${notification.read ? 'transparent' : 'var(--primary)'}`,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    display: 'flex',
                                    gap: '1.5rem',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                }}
                            >
                                <div style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-body)' }}>
                                    {getIcon(notification.type, notification.message)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: notification.read ? '500' : '600', color: 'var(--text-main)', fontSize: '1rem' }}>
                                        {notification.message}
                                    </p>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {formatDate(notification.createdAt)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {!notification.read && (
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default NotificationPage;
