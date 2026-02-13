import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/shared/Layout';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { FaPaperPlane, FaCalendarAlt } from 'react-icons/fa';

const ApplyLeave = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        startTime: '',
        startPeriod: 'AM',
        endTime: '',
        endPeriod: 'PM',
        leaveType: 'Sick',
        reason: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const { startDate, endDate, startTime, endTime } = formData;

        if (new Date(startDate) > new Date(endDate)) {
            addToast('End Date cannot be before Start Date', 'error');
            return false;
        }

        if (startDate === endDate && startTime && endTime) {
            // Simple comparison for same day (assuming 24h format from native input, but we might need to handle AM/PM)
            // If they are using native time input, it usually returns 24h format.
            if (startTime >= endTime) {
                addToast('End Time must be after Start Time', 'error');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await axios.post('http://localhost:5000/api/leaves/apply', {
                ...formData,
                startTime: `${formData.startTime} ${formData.startPeriod}`,
                endTime: `${formData.endTime} ${formData.endPeriod}`,
                studentId: user._id
            });
            addToast('Leave Application Submitted Successfully!', 'success');
            setFormData({ startDate: '', endDate: '', startTime: '', startPeriod: 'AM', endTime: '', endPeriod: 'PM', leaveType: 'Sick', reason: '' });
            navigate('/student-dashboard'); // Redirect to dashboard to see the new leave in history
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to apply leave', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout title="Apply for Leave">
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
                <GlassCard className="fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                        <FaPaperPlane style={{ color: 'var(--primary)', fontSize: '1.4rem' }} />
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>Leave Application Form</h2>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fill out the details below to request a leave.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>Leave Type</label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {['Sick', 'Casual', 'Academic', 'Personal'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, leaveType: type })}
                                        style={{
                                            flex: '1 0 120px',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            border: `2px solid ${formData.leaveType === type ? 'var(--primary)' : 'transparent'}`,
                                            background: formData.leaveType === type ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.4)',
                                            color: formData.leaveType === type ? 'var(--primary)' : 'var(--text-muted)',
                                            fontWeight: formData.leaveType === type ? '600' : '400',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <FaCalendarAlt />
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <Input
                                label="Start Date"
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                                id="startDate"
                            />
                            <Input
                                label="To Date"
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                                id="endDate"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="input-group">
                                <label htmlFor="startTime" style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: 'var(--text-main)'
                                }}>Start Time</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <input
                                        type="time"
                                        name="startTime"
                                        id="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className="modern-input time-input"
                                        style={{ flex: 1 }}
                                        required
                                    />
                                    <select
                                        name="startPeriod"
                                        value={formData.startPeriod}
                                        onChange={handleChange}
                                        className="modern-input"
                                        style={{ width: '80px', padding: '0.9rem 0.5rem' }}
                                    >
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="endTime" style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: 'var(--text-main)'
                                }}>End Time</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <input
                                        type="time"
                                        name="endTime"
                                        id="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className="modern-input time-input"
                                        style={{ flex: 1 }}
                                        required
                                        disabled={!formData.startTime}
                                    />
                                    <select
                                        name="endPeriod"
                                        value={formData.endPeriod}
                                        onChange={handleChange}
                                        className="modern-input"
                                        style={{ width: '80px', padding: '0.9rem 0.5rem' }}
                                        disabled={!formData.startTime}
                                    >
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Duration and Period Badge */}
                        {formData.duration && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '2rem',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.4)',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Duration:</span>
                                <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1.1rem' }}>{formData.duration}</span>

                                {formData.period && (
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        backgroundColor: formData.period === 'Half Day' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        color: formData.period === 'Half Day' ? '#3b82f6' : '#10b981',
                                        marginLeft: 'auto'
                                    }}>
                                        {formData.period}
                                    </span>
                                )}
                            </div>
                        )}

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Reason for Leave</label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                className="modern-input"
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    resize: 'vertical',
                                }}
                                placeholder="Please explain the reason for your leave request..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/student-dashboard')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={isSubmitting} style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
                                Submit Application
                            </Button>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </Layout>
    );
};

export default ApplyLeave;
