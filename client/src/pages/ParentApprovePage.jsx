import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import GlassCard from '../components/ui/GlassCard';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ParentApprovePage = () => {
    const { id } = useParams();
    const [leave, setLeave] = useState(null);
    const [status, setStatus] = useState('processing'); // 'processing', 'Approved', 'Rejected', 'error'
    const [error, setError] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');
        const decision = queryParams.get('decision');

        if (token && decision) {
            handleDirectDecision(token, decision);
        } else {
            fetchLeaveDetails();
        }
    }, [id]);

    const handleDirectDecision = async (token, decision) => {
        try {
            const res = await axios.get(`${API_URL}/api/leaves/public/${id}/parent-decision-token`, {
                params: { token, decision }
            });
            if (res.data.success) {
                setStatus(decision);
                fetchLeaveDetails();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Link invalid or expired.');
            setStatus('error');
            fetchLeaveDetails();
        }
    };

    const fetchLeaveDetails = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/leaves/public/${id}`);
            setLeave(res.data);
            if (status === 'processing') {
                if (res.data.parent_status !== 'Pending') {
                    setStatus(res.data.parent_status);
                }
            }
        } catch (err) {
            if (status !== 'error') {
                setError('Unable to load leave details.');
                setStatus('error');
            }
        }
    };

    if (status === 'processing' && !leave) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner"></div></div>;
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <GlassCard style={{ width: '100%', maxWidth: '450px', padding: '40px', textAlign: 'center', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                <h2 style={{ color: '#1e293b', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Leave Details</h2>
                
                {leave && (
                    <div style={{ textAlign: 'left', background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>
                            <span style={{ color: '#64748b', fontWeight: '500' }}>Student: </span>
                            <span style={{ color: '#1e293b', fontWeight: '600' }}>{leave.studentId?.name}</span>
                        </p>
                        <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>
                            <span style={{ color: '#64748b', fontWeight: '500' }}>Date: </span>
                            <span style={{ color: '#1e293b', fontWeight: '600' }}>
                                {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </p>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                            <span style={{ color: '#64748b', fontWeight: '500' }}>Reason: </span>
                            <span style={{ color: '#1e293b', fontWeight: '600' }}>{leave.reason}</span>
                        </p>
                    </div>
                )}

                <div style={{ marginTop: '1.5rem' }}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1e293b', fontWeight: '600' }}>
                        Status: {status === 'Approved' && <span style={{ color: '#10b981' }}>✅ Approved</span>}
                        {status === 'Rejected' && <span style={{ color: '#ef4444' }}>❌ Rejected</span>}
                        {status === 'processing' && leave?.parent_status === 'Pending' && <span style={{ color: '#f59e0b' }}>⏳ Pending</span>}
                        {status === 'error' && <span style={{ color: '#ef4444' }}>{error}</span>}
                    </p>
                </div>
            </GlassCard>
        </div>
    );
};

export default ParentApprovePage;
