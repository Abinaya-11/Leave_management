import React from 'react';
import { FaBars, FaSun, FaMoon, FaGraduationCap } from 'react-icons/fa';
import NotificationBell from '../NotificationBell';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = ({ toggleSidebar, title }) => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();

    return (
        <nav className="top-navbar">
            <div className="navbar-left">
                <button
                    className="menu-toggle"
                    onClick={toggleSidebar}
                    aria-label="Toggle Navigation"
                >
                    <FaBars />
                </button>
                <h1 className="page-title">{title}</h1>
            </div>

            <div className="navbar-center desktop-only">
                <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaGraduationCap className="brand-icon" style={{ fontSize: '24px', color: 'var(--primary)' }} />
                    <span className="brand-text" style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>CampusLeave Portal</span>
                </div>
            </div>

            <div className="navbar-right">
                {user && (
                    <div className="user-info-display">
                        <span className="user-name-role">
                            {user.name} ({user.role.charAt(0).toUpperCase() + user.role.slice(1)})
                        </span>
                    </div>
                )}

                <button
                    onClick={toggleTheme}
                    className="theme-toggle-btn"
                    aria-label="Toggle Theme"
                >
                    {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
                </button>

                <NotificationBell />
            </div>
        </nav>
    );
};

export default Navbar;
