import React from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { unreadCount } = useNotification();
    const navigate = useNavigate();

    return (
        <div
            style={{ position: 'relative', cursor: 'pointer', marginRight: '1rem' }}
            onClick={() => navigate('/notifications')}
        >
            <FaBell style={{ fontSize: '1.4rem', color: 'var(--text-main)' }} />
            {unreadCount > 0 && (
                <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    border: '2px solid white'
                }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </div>
    );
};

export default NotificationBell;
