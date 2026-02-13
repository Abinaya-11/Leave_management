import React from 'react';
import { FaBars, FaSun, FaMoon } from 'react-icons/fa';
import NotificationBell from '../NotificationBell';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = ({ toggleSidebar, title }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="top-navbar glass-panel">
            <div className="navbar-left">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <FaBars />
                </button>
                <h1 className="page-title">{title}</h1>
            </div>

            <div className="navbar-right">
                <button
                    onClick={toggleTheme}
                    className="theme-toggle-btn"
                    aria-label="Toggle Theme"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        borderRadius: '50%',
                        transition: 'background 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                </button>
                <NotificationBell />
            </div>
        </nav>
    );
};

export default Navbar;
