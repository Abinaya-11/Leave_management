import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { FaCalendarPlus, FaTrash, FaClock, FaCalendarAlt } from 'react-icons/fa';
import Layout from '../../components/shared/Layout';
import GlassCard from '../../components/ui/GlassCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

const GPSchedule = () => {
    const { addToast } = useToast();
    const { theme } = useTheme();
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        start_date: '',
        end_date: '',
        start_time: '17:00',
        end_time: '20:00',
        description: 'GP'
    });

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/gp-schedules`);
            setSchedules(res.data);
        } catch (err) {
            addToast('Failed to fetch GP schedules', 'error');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post(`${API_URL}/api/admin/gp-schedules`, formData);
            addToast('GP Schedule created successfully', 'success');
            setFormData({ start_date: '', end_date: '', start_time: '17:00', end_time: '20:00', description: 'GP' });
            fetchSchedules();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to create schedule', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this schedule?')) return;
        try {
            await axios.delete(`${API_URL}/api/admin/gp-schedules/${id}`);
            addToast('Schedule deleted', 'success');
            fetchSchedules();
        } catch (err) {
            addToast('Failed to delete schedule', 'error');
        }
    };

    const buttonStyle = {
        width: '100%',
        background: theme === 'light' ? 'var(--primary)' : undefined,
        color: theme === 'light' ? '#fff' : undefined
    };

    return (
        <Layout title="GP Schedule Management">
            <div className="fade-in">
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>GP Schedule Management</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <GlassCard style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                <FaCalendarPlus style={{ fontSize: '1.2rem' }} />
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Add New GP Range</h3>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <Input
                                        label="Start Date"
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                        id="start_date"
                                    />
                                    <Input
                                        label="End Date"
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        required
                                        id="end_date"
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <Input
                                        label="Start Time"
                                        type="time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleChange}
                                        required
                                        id="start_time"
                                    />
                                    <Input
                                        label="End Time"
                                        type="time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleChange}
                                        required
                                        id="end_time"
                                    />
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <Input
                                        label="Description / Reason"
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="e.g. Weekend GP"
                                        id="description"
                                    />
                                </div>

                                <Button type="submit" isLoading={isLoading} style={buttonStyle}>
                                    Add Schedule
                                </Button>
                            </form>
                        </GlassCard>
                    </div>

                    <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <GlassCard style={{ padding: 0 }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <FaCalendarAlt style={{ color: 'var(--primary)' }} /> Upcoming/Past Schedules
                                </h3>
                            </div>

                            <div style={{ maxHeight: '450px', overflowY: 'auto', padding: '1rem' }}>
                                {schedules.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        No GP schedules found.
                                    </div>
                                ) : (
                                    schedules.map((schedule) => (
                                        <div key={schedule._id} style={{
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '12px',
                                            marginBottom: '1rem',
                                            border: '1px solid var(--glass-border)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                                    {new Date(schedule.start_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} - {new Date(schedule.end_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FaClock style={{ fontSize: '0.75rem' }} /> {schedule.start_time} - {schedule.end_time}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '500', marginTop: '0.25rem' }}>
                                                    {schedule.description}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(schedule._id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    padding: '0.6rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default GPSchedule;
