import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import Layout from '../components/shared/Layout';
import GlassCard from '../components/ui/GlassCard';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { FaCalendarPlus, FaEdit, FaTimesCircle, FaUsers, FaMapMarkerAlt, FaPlus, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const EventManagement = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEventId, setCurrentEventId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        event_name: '',
        event_type: 'OD Event',
        od_type: '',
        event_organizer: '',
        event_location: '',
        event_start_date: '',
        event_end_date: '',
        event_description: '',
        max_participants: '',
        event_proof_required: 'no',
        event_details: {}
    });

    const getAvailableOdTypes = () => {
        if (user?.role === 'placement_cell') return ["ONDUTY_OFFCAMPUS", "ONDUTY_INTERNSHIP", "ONDUTY_TRAINING"];
        if (user?.role === 'iecc') return ["ONDUTY_EVENTS", "ONDUTY_PROJECT_COMP", "ONDUTY_PAPER_PRESENTATION", "ONDUTY_TECH_COMP", "ONDUTY_NPTEL", "ONDUTY_TRAINING", "ONDUTY_GOVT_EXAM"];
        if (user?.role === 'clubs_coordinator') return ["ONDUTY_CLUBS"];
        return [];
    };

    const odConfig = {
        // Placement Cell
        "ONDUTY_OFFCAMPUS": ["Company Name", "Job Role", "Location", "Start Date", "End Date", "Eligible Departments"],
        "ONDUTY_INTERNSHIP": ["Company Name", "Internship Role", "Location", "Start Date", "End Date"],
        "ONDUTY_TRAINING": ["Course Name", "Organized By", "Location", "Start Date", "End Date"],
        
        // IECC
        "ONDUTY_EVENTS": ["Event Title", "Organizing Institution", "Location", "Start Date", "End Date"],
        "ONDUTY_PROJECT_COMP": ["Project Title", "Organizing Institution", "Location", "Start Date", "End Date"],
        "ONDUTY_PAPER_PRESENTATION": ["Paper Title", "Organizing Institution", "Location", "Start Date", "End Date"],
        "ONDUTY_TECH_COMP": ["Competition Title", "Organizing Institution", "Location", "Start Date", "End Date"],
        "ONDUTY_NPTEL": ["Course Name", "Organizing Institution", "Location", "Exam Date"],
        
        // Clubs
        "ONDUTY_CLUBS": ["Club Name", "Event Name", "Event Type", "Location", "Event Date", "Coordinator"],

        // Others (assuming default formats to avoid breaking existing functionality)
        "ONDUTY_NSS_NCC": ["Camp/Program Name", "Role/Rank", "Start Date", "End Date", "Location"],
        "ONDUTY_SPORTS": ["Sport Name", "Tournament Name", "Level", "Tournament Start Date", "Tournament End Date"],
        "ONDUTY_GOVT_EXAM": ["Exam Name", "Exam Date", "Exam Center"],
    };

    useEffect(() => {
        if (user) fetchEvents();
    }, [user]);

    const getCellName = () => {
        if (user?.role === 'placement_cell') return 'Placement Cell';
        if (user?.role === 'iecc') return 'IECC';
        if (user?.role === 'clubs_coordinator') return 'Clubs';
        return '';
    };

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/events?cell=${getCellName()}`);
            if (res.data && res.data.success) {
                setEvents(res.data.data);
            }
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch events', 'error');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'od_type') {
            setFormData({ ...formData, [name]: value, event_details: {} });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleDetailChange = (field, value) => {
        setFormData({
            ...formData,
            event_details: {
                ...formData.event_details,
                [field]: value
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const dataToSubmit = {
                ...formData,
                event_type: formData.od_type.replace('ONDUTY_', '').replace('_', ' '),
                max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
            };

            if (isEditing) {
                await axios.put(`http://localhost:5000/api/events/${currentEventId}`, dataToSubmit, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                addToast('Event updated successfully', 'success');
            } else {
                await axios.post('http://localhost:5000/api/events', dataToSubmit, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                addToast('Event created successfully', 'success');
            }
            setShowModal(false);
            fetchEvents();
        } catch (err) {
            addToast(err.response?.data?.message || 'Action failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (event) => {
        setFormData({
            event_name: event.event_name || '',
            od_type: event.od_type || '',
            event_type: event.event_type || 'OD Event',
            event_organizer: event.event_organizer || '',
            event_location: event.event_location || '',
            event_start_date: event.event_start_date ? event.event_start_date.split('T')[0] : '',
            event_end_date: event.event_end_date ? event.event_end_date.split('T')[0] : '',
            event_description: event.event_description || '',
            max_participants: event.max_participants || '',
            event_proof_required: event.event_proof_required || 'no',
            event_details: event.event_details || {}
        });
        setCurrentEventId(event._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this event?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/events/${id}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast('Event cancelled successfully', 'success');
            fetchEvents();
        } catch (err) {
            addToast('Failed to cancel event', 'error');
        }
    };

    const getStatusBadge = (status) => {
        let className = 'status-badge ';
        if (status === 'Active') className += 'status-approved';
        else if (status === 'Cancelled') className += 'status-rejected';
        else className += 'status-pending';
        return <span className={className}>{status}</span>;
    };

    return (
        <Layout title="Event Schedule Management">
            <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Event Schedule</h2>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage upcoming events for {getCellName()}</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { 
                        setIsEditing(false); 
                        setFormData({ 
                            event_name: '', event_type: 'OD Event', od_type: '', event_organizer: '', 
                            event_location: '', event_start_date: '', event_end_date: '', 
                            event_description: '', max_participants: '', event_proof_required: 'no', event_details: {}
                        }); 
                        setShowModal(true); 
                    }}>
                        <FaPlus style={{ marginRight: '8px' }} /> Create Event
                    </button>
                </div>

                <GlassCard>
                    <div className="table-container">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Event Name</th>
                                    <th>OD Type / Category</th>
                                    <th>Location</th>
                                    <th style={{ textAlign: 'center' }}>Dates</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                    <th style={{ textAlign: 'center' }}>Participants</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No events scheduled yet.</td>
                                    </tr>
                                ) : (
                                    events.map((event) => (
                                        <tr key={event._id}>
                                            <td><div style={{ fontWeight: '600' }}>{event.event_name}</div></td>
                                            <td>{event.od_type ? event.od_type.replace('ONDUTY_', '').replace('_', ' ') : event.event_type}</td>
                                            <td><span style={{ fontSize: '0.9rem' }}><FaMapMarkerAlt size={10} style={{ marginRight: '4px' }} /> {event.event_location}</span></td>
                                            <td style={{ textAlign: 'center', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                                {new Date(event.event_start_date).toLocaleDateString()} -<br />
                                                {new Date(event.event_end_date).toLocaleDateString()}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{getStatusBadge(event.status)}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                                    <FaUsers color="var(--primary)" />
                                                    <span style={{ fontWeight: '700' }}>{event.participants_count}</span>
                                                    {event.max_participants && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/ {event.max_participants}</span>}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <button className="btn btn-outline" onClick={() => handleEdit(event)} title="Edit"><FaEdit /></button>
                                                    {(event.status === 'Active' || event.status === 'Inactive') && <button className="btn btn-danger" onClick={() => handleCancel(event._id)} title="Cancel"><FaTimesCircle /></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEditing ? 'Edit Event' : 'Schedule New Event'}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>OD Type *</label>
                            <select name="od_type" value={formData.od_type} onChange={handleChange} required className="modern-input" style={{ width: '100%', borderRadius: '12px' }}>
                                <option value="">Select OD Type...</option>
                                {getAvailableOdTypes().map(t => (
                                    <option key={t} value={t}>{t.replace('ONDUTY_', '').replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <Input label="Event Name/Title *" name="event_name" value={formData.event_name} onChange={handleChange} required placeholder="e.g. Campus Recruitment" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Input label="Organizer / Company / Institution *" name="event_organizer" value={formData.event_organizer} onChange={handleChange} required placeholder="e.g. Amazon / Tech Cell" />
                        <Input label="Location *" name="event_location" value={formData.event_location} onChange={handleChange} required placeholder="e.g. Chennai" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Input label="Start Date *" type="date" name="event_start_date" value={formData.event_start_date} onChange={handleChange} required />
                        <Input label="End Date *" type="date" name="event_end_date" value={formData.event_end_date} onChange={handleChange} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Input label="Max Participants (Optional)" type="number" name="max_participants" value={formData.max_participants} onChange={handleChange} />
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>Proof Required?</label>
                            <select name="event_proof_required" value={formData.event_proof_required} onChange={handleChange} className="modern-input" style={{ width: '100%', borderRadius: '12px' }}>
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Dynamic Extra Fields based on od_type */}
                    {formData.od_type && odConfig[formData.od_type] && (
                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {odConfig[formData.od_type].filter(field => {
                                    const f = field.toLowerCase();
                                    const isBase = f.includes('name') || f.includes('title') || f.includes('drive') || 
                                                 f.includes('location') || f.includes('center') || 
                                                 f.includes('organized') || f.includes('company') || f.includes('institution') ||
                                                 f.includes('date') || f.includes('description');
                                    return !isBase;
                                }).map((field, idx) => (
                                    <Input 
                                        key={idx} 
                                        label={`${field} *`} 
                                        name={field} 
                                        value={formData.event_details[field] || ''} 
                                        onChange={(e) => handleDetailChange(field, e.target.value)} 
                                        required 
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Event'}</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default EventManagement;
