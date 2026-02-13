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

    const getIcon = (type) => {
        switch (type) {
            case 'LEAVE_REQUEST': return <FaExclamationCircle style={{ color: '#f59e0b' }} />;
            case 'LEAVE_STATUS_UPDATE': return <FaInfoCircle style={{ color: '#3b82f6' }} />;
            default: return <FaBell style={{ color: 'var(--text-muted)' }} />;
        }
    };

    return (
        <Layout title="Notifications">
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
                <GlassCard className="fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FaBell style={{ color: 'var(--primary)', fontSize: '1.4rem' }} />
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>Your Notifications</h2>
                        </div>
                        <button onClick={markAllAsRead} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <FaCheckDouble /> Mark all as read
                        </button>
                    </div>

                    {notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <FaBell style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }} />
                            <p>No notifications yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        background: notification.read ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                                        borderLeft: `4px solid ${notification.read ? 'transparent' : 'var(--primary)'}`,
                                        marginBottom: '0.5rem',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        gap: '1rem',
                                        alignItems: 'start'
                                    }}
                                >
                                    <div style={{ marginTop: '4px', fontSize: '1.2rem' }}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: notification.read ? 'normal' : 'bold', color: 'var(--text-main)', fontSize: '1rem' }}>
                                            {notification.message}
                                        </p>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {formatDate(notification.createdAt)}
                                        </span>
                                    </div>
                                    {!notification.read && (
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'red', alignSelf: 'center' }}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            </div>
        </Layout>
    );
};

export default NotificationPage;
