import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaGraduationCap, FaHome, FaCalendarPlus, FaHistory, FaUser,
    FaClipboardList, FaCheckCircle, FaUsers, FaUserTie,
    FaClock, FaCalendarAlt, FaSignOutAlt, FaTimes, FaSitemap
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, isMobileOpen, toggleSidebar, closeSidebar, closeMobile }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const studentMenu = [
        { path: '/student-dashboard', label: 'Dashboard', icon: <FaHome /> },
        { path: '/apply-leave', label: 'Apply Leave', icon: <FaCalendarPlus /> },
        { path: '/profile', label: 'Profile', icon: <FaUser /> },
    ];

    const facultyMenu = [
        { path: '/faculty-dashboard', label: 'Dashboard', icon: <FaHome /> },
        { path: '/profile', label: 'Profile', icon: <FaUser /> },
    ];

    const adminMenu = [
        { path: '/admin-dashboard', label: 'Dashboard', icon: <FaHome /> },
        { path: '/admin/students', label: 'Student Management', icon: <FaUsers /> },
        { path: '/admin/faculties', label: 'Faculty Management', icon: <FaUserTie /> },
        { path: '/admin/assign-faculty', label: 'Assign Faculty', icon: <FaSitemap /> },
        { path: '/admin/leaves', label: 'Leave Requests', icon: <FaClipboardList /> },
        { path: '/admin/gp-schedule', label: 'GP Schedule', icon: <FaClock /> },
        { path: '/admin/academic-calendar', label: 'Academic Calendar', icon: <FaCalendarAlt /> },
    ];

    const placementMenu = [
        { path: '/placement-cell-dashboard', label: 'Dashboard', icon: <FaHome /> },
        { path: '/placement-cell/schedule', label: 'OD Events', icon: <FaCalendarAlt /> },
        { path: '/profile', label: 'Profile', icon: <FaUser /> },
    ];

    const clubsMenu = [
        { path: '/clubs-dashboard', label: 'Dashboard', icon: <FaHome /> },
        { path: '/clubs/schedule', label: 'Club Events', icon: <FaCalendarAlt /> },
        { path: '/profile', label: 'Profile', icon: <FaUser /> },
    ];

    const ieccMenu = [
        { path: '/iecc-dashboard', label: 'Dashboard', icon: <FaHome /> },
        { path: '/iecc/schedule', label: 'OD Events', icon: <FaCalendarAlt /> },
        { path: '/profile', label: 'Profile', icon: <FaUser /> },
    ];

    const getMenuItems = () => {
        if (user?.role === 'student') return studentMenu;
        if (user?.role === 'faculty') return facultyMenu;
        if (user?.role === 'admin') return adminMenu;
        if (user?.role === 'placement_cell') return placementMenu;
        if (user?.role === 'clubs_coordinator') return clubsMenu;
        if (user?.role === 'iecc') return ieccMenu;
        return [];
    };

    const navItems = getMenuItems();

    return (
        <>
            <div
                className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
                onClick={closeMobile}
            ></div>

            <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="brand">
                        <FaGraduationCap className="brand-icon" />
                        <span className="brand-text">CampusLeave Portal</span>
                    </div>
                    <button className="close-btn" onClick={closeMobile}>
                        <FaTimes size={18} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    closeMobile && closeMobile();
                                } else {
                                    closeSidebar && closeSidebar();
                                }
                            }}
                            title={isCollapsed ? item.label : ''}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="avatar-circle">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="user-meta">
                            <span className="user-fullname">{user?.name}</span>
                            <span className="user-role-label">{user?.role}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-button">
                        <span className="nav-icon"><FaSignOutAlt /></span>
                        <span className="logout-text">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
