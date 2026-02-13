import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children, title }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="app-container">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} title={title} />
                <div className="content-wrapper fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
