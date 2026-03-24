import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { FaPlus, FaTrash, FaEdit, FaCalendarDay, FaInfoCircle } from 'react-icons/fa';
import Layout from '../../components/shared/Layout';
import GlassCard from '../../components/ui/GlassCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

const AcademicCalendar = () => {
    const { addToast } = useToast();
    const { theme } = useTheme();
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [formData, setFormData] = useState({
        event_name: '',
        event_type: 'Exam',
        start_date: '',
        end_date: '',
        description: ''
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/academic-events`);
            setEvents(res.data);
        } catch (err) {
            addToast('Failed to fetch events', 'error');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isEditing) {
                await axios.put(`${API_URL}/api/admin/academic-events/${isEditing}`, formData);
                addToast('Event updated successfully', 'success');
            } else {
                await axios.post(`${API_URL}/api/admin/academic-events`, formData);
                addToast('Event created successfully', 'success');
            }
            setFormData({ event_name: '', event_type: 'Exam', start_date: '', end_date: '', description: '' });
            setIsEditing(null);
            fetchEvents();
        } catch (err) {
            addToast('Failed to save event', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (event) => {
        setIsEditing(event._id);
        setFormData({
            event_name: event.event_name,
            event_type: event.event_type,
            start_date: event.start_date.split('T')[0],
            end_date: event.end_date.split('T')[0],
            description: event.description || ''
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            await axios.delete(`${API_URL}/api/admin/academic-events/${id}`);
            addToast('Event deleted', 'success');
            fetchEvents();
        } catch (err) {
            addToast('Failed to delete event', 'error');
        }
    };

    const buttonStyle = {
        flex: 1,
        background: theme === 'light' ? 'var(--primary)' : undefined,
        color: theme === 'light' ? '#fff' : undefined
    };

    const eventTypes = ['Exam', 'Symposium', 'College Event', 'Seminar', 'Internal Assessment', 'Holiday', 'Other'];

    return (
        <Layout title="Academic Calendar">
            <div className="fade-in">
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>Academic Calendar</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage important college dates and events</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <GlassCard style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                <FaPlus style={{ fontSize: '1.2rem' }} />
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{isEditing ? 'Edit Event' : 'Add New Event'}</h3>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <Input
                                        label="Event Name"
                                        type="text"
                                        name="event_name"
                                        value={formData.event_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. End Semester Exams"
                                        id="event_name"
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div className="input-group">
                                        <label htmlFor="event_type" style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            color: 'var(--text-main)'
                                        }}>Event Type</label>
                                        <select
                                            name="event_type"
                                            id="event_type"
                                            value={formData.event_type}
                                            onChange={handleChange}
                                            className="modern-input"
                                            style={{ width: '100%', appearance: 'auto' }}
                                        >
                                            {eventTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

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

                                <div style={{ marginBottom: '2rem' }}>
                                    <Input
                                        label="Description"
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Brief description..."
                                        id="description"
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {isEditing && (
                                        <Button type="button" variant="secondary" onClick={() => {
                                            setIsEditing(null);
                                            setFormData({ event_name: '', event_type: 'Exam', start_date: '', end_date: '', description: '' });
                                        }} style={{ flex: 1 }}>
                                            Cancel
                                        </Button>
                                    )}
                                    <Button type="submit" isLoading={isLoading} style={buttonStyle}>
                                        {isEditing ? 'Update Event' : 'Add Event'}
                                    </Button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>

                    <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <GlassCard style={{ padding: 0 }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>Scheduled Events</h3>
                            </div>

                            <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '1rem' }}>
                                {events.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        <FaCalendarDay style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }} />
                                        <p>No academic events scheduled.</p>
                                    </div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                                <th style={tHeader}>Event</th>
                                                <th style={tHeader}>Range</th>
                                                <th style={tHeader}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {events.map((event) => (
                                                <tr key={event._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                    <td style={tCell}>
                                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{event.event_name}</div>
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            padding: '0.1rem 0.4rem',
                                                            borderRadius: '4px',
                                                            background: 'rgba(59, 130, 246, 0.1)',
                                                            color: '#3b82f6',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {event.event_type}
                                                        </span>
                                                    </td>
                                                    <td style={tCell}>
                                                        <div style={{ fontSize: '0.85rem' }}>
                                                            {new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} -
                                                            {new Date(event.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                    </td>
                                                    <td style={tCell}>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={() => handleEdit(event)} style={actionBtn} title="Edit"><FaEdit /></button>
                                                            <button onClick={() => handleDelete(event._id)} style={{ ...actionBtn, color: '#ef4444' }} title="Delete"><FaTrash /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const tHeader = { padding: '1rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' };
const tCell = { padding: '1rem 0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' };
const actionBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.4rem', borderRadius: '6px', color: 'var(--primary)', display: 'flex', alignItems: 'center' };

export default AcademicCalendar;
