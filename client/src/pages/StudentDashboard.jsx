import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import Layout from '../components/shared/Layout';
import LeaveStats from '../components/dashboard/LeaveStats';
import LeaveHistory from '../components/dashboard/LeaveHistory';
import { FaChartPie, FaList } from 'react-icons/fa';

const StudentDashboard = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [leaves, setLeaves] = useState([]);

    // Fetch leave history
    useEffect(() => {
        if (user) {
            fetchLeaves();
        }
    }, [user]);

    const fetchLeaves = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/leaves/student/${user._id}`);
            setLeaves(res.data);
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch leave history', 'error');
        }
    };

    return (
        <Layout title="Student Dashboard">
            <div className="fade-in">
                {/* Attendance Summary Cards */}
                <LeaveStats leaves={leaves} />

                {/* Leave History Table */}
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Leave History</h3>
                    <LeaveHistory leaves={leaves} />
                </div>
            </div>
        </Layout>
    );
};

export default StudentDashboard;
