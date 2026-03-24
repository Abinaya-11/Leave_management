import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css';

const Layout = ({ children, title }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleSidebar = () => {
        if (window.innerWidth < 1024) {
            setIsMobileOpen(!isMobileOpen);
        } else {
            setIsSidebarCollapsed(!isSidebarCollapsed);
        }
    };

    return (
        <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Navbar toggleSidebar={toggleSidebar} title={title} />
            <div className="main-layout-body">
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    isMobileOpen={isMobileOpen}
                    toggleSidebar={toggleSidebar}
                    closeSidebar={() => setIsSidebarCollapsed(true)}
                    closeMobile={() => setIsMobileOpen(false)}
                />

                <main className="main-content">
                    <div className="content-wrapper">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
