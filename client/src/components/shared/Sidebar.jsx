import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaChalkboardTeacher, FaCalendarCheck, FaSignOutAlt, FaBars, FaTimes, FaHome, FaUsers, FaUserTie, FaClipboardList, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        ...(user?.role === 'student' ? [
            { path: '/student-dashboard', label: 'Dashboard', icon: <FaHome /> },
            { path: '/apply-leave', label: 'Apply Leave', icon: <FaCalendarCheck /> },
        ] : []),
        ...(user?.role === 'faculty' ? [
            { path: '/faculty-dashboard', label: 'Dashboard', icon: <FaChalkboardTeacher /> },
        ] : []),
        ...(user?.role === 'admin' ? [
            { path: '/admin-dashboard', label: 'Dashboard', icon: <FaHome /> },
            { path: '/admin/students', label: 'Students', icon: <FaUsers /> },
            { path: '/admin/faculties', label: 'Faculties', icon: <FaUserTie /> },
            { path: '/admin/leaves', label: 'Leave Requests', icon: <FaClipboardList /> },
            { path: '/admin/reports', label: 'Reports', icon: <FaFileAlt /> },
        ] : []),
    ];

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
            <aside className={`sidebar glass-panel ${isOpen ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <div className="brand">
                        <FaGraduationCap className="brand-icon" />
                        <span className="brand-text">Leave System</span>
                    </div>
                    <button className="close-btn" onClick={toggleSidebar}>
                        <FaTimes />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={toggleSidebar}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="avatar">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <FaSignOutAlt />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
