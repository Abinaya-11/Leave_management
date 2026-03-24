import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import Layout from '../components/shared/Layout';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { FaPaperPlane, FaCalendarAlt } from 'react-icons/fa';

const ApplyLeave = () => {
    const { user, loading } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [academicEvents, setAcademicEvents] = useState([]);
    const [warning, setWarning] = useState('');

    const [availableEvents, setAvailableEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');

    React.useEffect(() => {
        fetchAcademicEvents();
        // Check for parent details
        if (user && user.role === 'student' && !user.parent_email) {
            addToast('Please provide parent details on the dashboard before applying for leave.', 'warning');
            navigate('/student-dashboard');
        }
    }, [user, navigate]);

    const getOrganizingCell = (lType) => {
        if (["ONDUTY_INTERNSHIP", "ONDUTY_OFFCAMPUS", "ONDUTY_TRAINING"].includes(lType)) {
            return 'Placement Cell';
        } else if (["ONDUTY_SPORTS", "ONDUTY_CLUBS", "ONDUTY_NSS_NCC"].includes(lType)) {
            return 'Clubs';
        } else {
            return 'IECC';
        }
    };

    const fetchEventsByOdType = async (odType) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/events?od_type=${odType}&activeOnly=true`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data && res.data.success) {
                setAvailableEvents(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch events', err);
        }
    };

    const fetchAcademicEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/leaves/academic-calendar`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAcademicEvents(res.data);
        } catch (err) {
            console.error('Failed to fetch academic events', err);
        }
    };

    // Filter leave types based on student type
    const getLeaveTypes = () => {
        const studentType = (user?.student_type || user?.studentType)?.toUpperCase();

        const hostellerLeaveTypes = [
            { label: "OnDuty - Events", value: "ONDUTY_EVENTS" },
            { label: "OnDuty - Project Competition", value: "ONDUTY_PROJECT_COMP" },
            { label: "OnDuty - Internship", value: "ONDUTY_INTERNSHIP" },
            { label: "OnDuty - Paper Presentation", value: "ONDUTY_PAPER_PRESENTATION" },
            { label: "OnDuty - Technical Competition", value: "ONDUTY_TECH_COMP" },
            { label: "OnDuty - NSS/NCC", value: "ONDUTY_NSS_NCC" },
            { label: "OnDuty - Sports", value: "ONDUTY_SPORTS" },
            { label: "OnDuty - NPTEL Exam", value: "ONDUTY_NPTEL" },
            { label: "OnDuty - Offcampus Placement", value: "ONDUTY_OFFCAMPUS" },
            { label: "OnDuty - Training Course", value: "ONDUTY_TRAINING" },
            { label: "OnDuty - Govt Exams", value: "ONDUTY_GOVT_EXAM" },
            { label: "OnDuty - Clubs", value: "ONDUTY_CLUBS" },
            { label: "SP", value: "SP" },
            { label: "GP", value: "GP" },
            { label: "Sick Leave", value: "SICK" },
            { label: "Emergency Leave", value: "EMERGENCY" }
        ];

        const dayscholarLeaveTypes = [
            { label: "OnDuty - Events", value: "ONDUTY_EVENTS" },
            { label: "OnDuty - Project Competition", value: "ONDUTY_PROJECT_COMP" },
            { label: "OnDuty - Internship", value: "ONDUTY_INTERNSHIP" },
            { label: "OnDuty - Paper Presentation", value: "ONDUTY_PAPER_PRESENTATION" },
            { label: "OnDuty - Technical Competition", value: "ONDUTY_TECH_COMP" },
            { label: "OnDuty - NSS/NCC", value: "ONDUTY_NSS_NCC" },
            { label: "OnDuty - Sports", value: "ONDUTY_SPORTS" },
            { label: "OnDuty - NPTEL Exam", value: "ONDUTY_NPTEL" },
            { label: "OnDuty - Offcampus Placement", value: "ONDUTY_OFFCAMPUS" },
            { label: "OnDuty - Training Course", value: "ONDUTY_TRAINING" },
            { label: "OnDuty - Govt Exams", value: "ONDUTY_GOVT_EXAM" },
            { label: "OnDuty - Clubs", value: "ONDUTY_CLUBS" },
            { label: "Leave", value: "GENERAL_LEAVE" }
        ];

        return studentType === "HOSTELLER" ? hostellerLeaveTypes : dayscholarLeaveTypes;
    };

    const currentLeaveTypes = getLeaveTypes();

    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        fromTime: '', // 24-hour native system time "HH:MM"
        toTime: '',   // 24-hour native system time "HH:MM"
        leaveType: '',
        reason: '',
        // OD Event Details
        eventName: '',
        eventOrganizer: '',
        eventLocation: '',
        eventEndDate: '',
        eventDescription: '',
        proofDocument: '',
        odDetails: {}
    });

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

    const odLeaveTypes = [
        "ONDUTY_EVENTS", "ONDUTY_PROJECT_COMP", "ONDUTY_INTERNSHIP",
        "ONDUTY_PAPER_PRESENTATION", "ONDUTY_TECH_COMP", "ONDUTY_NSS_NCC",
        "ONDUTY_SPORTS", "ONDUTY_NPTEL", "ONDUTY_OFFCAMPUS", "ONDUTY_TRAINING",
        "ONDUTY_GOVT_EXAM", "ONDUTY_CLUBS"
    ];

    const isODLeave = odLeaveTypes.includes(formData.leaveType);

    if (loading) {
        return <div className="loading-container">Loading...</div>;
    }

    if (!user) {
        return <div className="error-container">Please login to apply for leave.</div>;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);

        if (name === 'leaveType') {
            setSelectedEventId('');
            const resetOdDetails = {};
            if (odConfig[value]) {
                odConfig[value].forEach(f => resetOdDetails[f] = '');
            }
            setFormData({ ...newFormData, odDetails: resetOdDetails });
            if (odLeaveTypes.includes(value)) {
                fetchEventsByOdType(value);
            } else {
                setAvailableEvents([]);
            }
        }

        // Check for academic event warning in the range [startDate, endDate]
        if (name === 'startDate' || name === 'endDate') {
            const start = new Date(newFormData.startDate);
            const end = new Date(newFormData.endDate);

            if (newFormData.startDate && newFormData.endDate && start <= end) {
                const event = academicEvents.find(ev => {
                    const evStart = new Date(ev.start_date);
                    const evEnd = new Date(ev.end_date);
                    // Overlap logic: EventStart <= LeaveEnd AND EventEnd >= LeaveStart
                    return evStart <= end && evEnd >= start;
                });

                if (event) {
                    setWarning(`Warning: An important academic event (${event.event_name}) is scheduled during the selected leave dates.`);
                } else {
                    setWarning('');
                }
            } else if (value) {
                // Check single date selection if range is incomplete
                const selectedDate = new Date(value);
                const event = academicEvents.find(ev => {
                    const evStart = new Date(ev.start_date).setHours(0, 0, 0, 0);
                    const evEnd = new Date(ev.end_date).setHours(23, 59, 59, 999);
                    return selectedDate >= evStart && selectedDate <= evEnd;
                });
                if (event) {
                    setWarning(`Warning: An important academic event (${event.event_name}) is scheduled on this date.`);
                } else {
                    setWarning('');
                }
            }
        }
    };

    const handleEventChange = (e) => {
        const eventId = e.target.value;
        setSelectedEventId(eventId);
        const event = availableEvents.find(ev => ev._id === eventId);
        if (event) {
            const currentConfig = odConfig[formData.leaveType] || [];
            let populatedOd = { ...formData.odDetails };

            // Determine generic names to match fields
            const nameField = currentConfig.find(f => f.toLowerCase().includes('name') || f.toLowerCase().includes('title') || f.toLowerCase().includes('drive'));
            if (nameField) populatedOd[nameField] = event.event_name;

            const locField = currentConfig.find(f => f.toLowerCase().includes('location') || f.toLowerCase().includes('center'));
            if (locField) populatedOd[locField] = event.event_location;

            const orgField = currentConfig.find(f => f.toLowerCase().includes('organized') || f.toLowerCase().includes('company'));
            if (orgField) populatedOd[orgField] = event.event_organizer;

            const startDateField = currentConfig.find(f => f.toLowerCase().includes('start date') || f.toLowerCase().includes('date'));
            if (startDateField) populatedOd[startDateField] = event.event_start_date.split('T')[0];

            const endDateField = currentConfig.find(f => f.toLowerCase().includes('end date'));
            if (endDateField) populatedOd[endDateField] = event.event_end_date.split('T')[0];

            const descriptionField = currentConfig.find(f => f.toLowerCase().includes('description'));
            if (descriptionField) populatedOd[descriptionField] = event.event_description;

            setFormData({
                ...formData,
                eventName: event.event_name, // keep legacy mapping as fallback
                eventOrganizer: event.event_organizer,
                eventLocation: event.event_location,
                eventStartDate: event.event_start_date.split('T')[0],
                eventEndDate: event.event_end_date.split('T')[0],
                eventDescription: event.event_description,
                event_id: eventId,
                odDetails: populatedOd
            });
        }
    };

    const handleOdDetailChange = (field, value) => {
        setFormData({
            ...formData,
            odDetails: {
                ...formData.odDetails,
                [field]: value
            }
        });
    };

    const validateForm = () => {
        const { startDate, endDate, fromTime, toTime, leaveType } = formData;

        if (!leaveType) {
            addToast('Please select a leave type', 'error');
            return false;
        }

        if (leaveType === 'GP') return true;

        if (!startDate || !endDate) {
            addToast('Please select start and end dates', 'error');
            return false;
        }

        if (new Date(startDate) > new Date(endDate)) {
            addToast('End Date cannot be before Start Date', 'error');
            return false;
        }

        // Past Date/Time Validation (Present and Future only)
        if (leaveType !== 'GP') {
            const now = new Date();
            const startDateTime = new Date(`${startDate}T${fromTime || '00:00'}`);
            
            // Adding a 1-minute grace period for user filling the form
            if (startDateTime < new Date(now.getTime() - 60000)) {
                addToast('Leave start date and time cannot be in the past', 'error');
                return false;
            }
        }

        if (leaveType !== 'GP' && (!fromTime || !toTime)) {
            addToast('Please select start and end times', 'error');
            return false;
        }

        if (isODLeave) {
            const requiredFields = odConfig[leaveType] || [];
            let isValid = true;
            requiredFields.forEach(field => {
                // Event Description might be optional based on user needs, but generally all are required
                if (!formData.odDetails[field]) {
                    if (field.toLowerCase().includes('description') || field.toLowerCase().includes('members')) {
                        // ignore completely optional fields, though mostly standard
                    } else {
                        isValid = false;
                    }
                }
            });

            if (!isValid) {
                addToast('Please fill all required OD details', 'error');
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
            const token = localStorage.getItem('token');

            // Format military time to 12-hour AM/PM string for backend compatibility
            const formatTimeAMPM = (time24m) => {
                if (!time24m) return '';
                const [hr, min] = time24m.split(':');
                let h = parseInt(hr, 10);
                const suffix = h >= 12 ? 'PM' : 'AM';
                if (h === 0) {
                    h = 12;
                } else if (h > 12) {
                    h -= 12;
                }
                const paddedH = h.toString().padStart(2, '0');
                return `${paddedH}:${min} ${suffix}`;
            };

            const periodDesc = (formData.fromTime || formData.toTime) ? 'Custom' : 'Full Day';

            await axios.post(`${API_URL}/api/leaves/apply`, {
                ...formData,
                period: periodDesc,
                startTime: formatTimeAMPM(formData.fromTime) || '12:00 AM',
                endTime: formatTimeAMPM(formData.toTime) || '11:59 PM',
                studentId: user._id,
                od_details: formData.odDetails
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            addToast('Leave Application Submitted Successfully!', 'success');
            setFormData({
                startDate: '',
                endDate: '',
                fromTime: '',
                toTime: '',
                leaveType: '',
                reason: '',
                eventName: '',
                eventOrganizer: '',
                eventLocation: '',
                eventStartDate: '',
                eventEndDate: '',
                eventDescription: '',
                proofDocument: '',
                odDetails: {}
            });
            navigate('/student-dashboard'); // Redirect to dashboard to see the new leave in history
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to apply leave', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout title="Apply for Leave">
            <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <GlassCard style={{ width: '100%', maxWidth: '1100px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                        <FaPaperPlane style={{ color: 'var(--primary)', fontSize: '1.4rem' }} />
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>Leave Application Form</h2>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fill out the details below to request a leave.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Row 1: Leave Type (Full Width) */}
                        <div style={{ width: '100%' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Leave Type *</label>
                            <div className="searchable-dropdown-container">
                                <select
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleChange}
                                    className="modern-input searchable-select"
                                    required
                                    style={{
                                        width: '100%',
                                        appearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 1rem center',
                                        backgroundSize: '1.2em',
                                        cursor: 'pointer',
                                        borderRadius: '12px'
                                    }}
                                >
                                    <option value="" disabled>Select a leave type...</option>
                                    {currentLeaveTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {formData.leaveType !== 'GP' && (
                            <>
                                {warning && (
                                    <div style={{
                                        padding: '1rem',
                                        background: 'rgba(245, 158, 11, 0.15)',
                                        color: '#d97706',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(245, 158, 11, 0.3)',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <FaCalendarAlt /> {warning}
                                    </div>
                                )}

                                {/* OD Event Details Section */}
                                {isODLeave && (
                                    <div className="fade-in" style={{ 
                                        padding: '1.5rem', 
                                        borderRadius: '16px', 
                                        background: 'rgba(255, 255, 255, 0.4)', 
                                        border: '1px solid var(--glass-border)',
                                        marginTop: '0.5rem'
                                    }}>
                                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Event Details</h3>
                                        
                                        <div style={{ width: '100%', marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>Select Scheduled Event *</label>
                                            <select
                                                name="selectedEventId"
                                                value={selectedEventId}
                                                onChange={handleEventChange}
                                                className="modern-input"
                                                required={isODLeave}
                                                style={{ width: '100%', borderRadius: '12px' }}
                                            >
                                                <option value="">-- Select Event --</option>
                                                {availableEvents.map(event => (
                                                    <option key={event._id} value={event._id}>
                                                        {event.event_name} ({new Date(event.event_start_date).toLocaleDateString()})
                                                    </option>
                                                ))}
                                            </select>
                                            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Only active events from {getOrganizingCell(formData.leaveType)} are shown.</p>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                            {(odConfig[formData.leaveType] || []).map((field, idx) => {
                                                const isTextarea = field.toLowerCase().includes('description');
                                                const isDate = field.toLowerCase().includes('date');
                                                const isOptional = field.toLowerCase().includes('optional') || field.toLowerCase().includes('members');
                                                
                                                if (isTextarea) {
                                                    return (
                                                        <div key={idx} style={{ gridColumn: '1 / -1' }}>
                                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>{field} {isOptional ? '' : '*'}</label>
                                                            <textarea
                                                                name={field}
                                                                value={formData.odDetails[field] || ''}
                                                                onChange={(e) => handleOdDetailChange(field, e.target.value)}
                                                                className="modern-input"
                                                                style={{ width: '100%', minHeight: '80px', borderRadius: '12px', padding: '0.8rem' }}
                                                                placeholder={`${field}...`}
                                                                readOnly={!!selectedEventId && !!formData.odDetails[field]}
                                                            />
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <Input
                                                        key={idx}
                                                        label={`${field} ${isOptional ? '' : '*'}`}
                                                        type={isDate ? "date" : "text"}
                                                        name={field}
                                                        value={formData.odDetails[field] || ''}
                                                        onChange={(e) => handleOdDetailChange(field, e.target.value)}
                                                        required={isODLeave && !isOptional}
                                                        readOnly={!!selectedEventId && !!formData.odDetails[field]}
                                                    />
                                                );
                                            })}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>Proof / Invitation Letter (Optional)</label>
                                                <input
                                                    type="file"
                                                    name="proofDocument"
                                                    onChange={(e) => setFormData({ ...formData, proofDocument: e.target.value })}
                                                    className="modern-input"
                                                    style={{ width: '100%', borderRadius: '12px' }}
                                                />
                                                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upload any relevant documents.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Row 2: Start Date | From Time */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                    <Input
                                        label="Leave start *"
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        required
                                        id="startDate"
                                        className="modern-input"
                                        style={{ borderRadius: '12px' }}
                                    />
                                    <Input
                                        label="From Time *"
                                        type="time"
                                        name="fromTime"
                                        value={formData.fromTime}
                                        onChange={handleChange}
                                        required
                                        id="fromTime"
                                        className="modern-input"
                                        style={{ borderRadius: '12px' }}
                                    />
                                </div>

                                {/* Row 3: End Date | To Time */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                    <Input
                                        label="Leave end *"
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        required
                                        id="endDate"
                                        className="modern-input"
                                        style={{ borderRadius: '12px' }}
                                    />
                                    <Input
                                        label="To Time *"
                                        type="time"
                                        name="toTime"
                                        value={formData.toTime}
                                        onChange={handleChange}
                                        required
                                        id="toTime"
                                        className="modern-input"
                                        style={{ borderRadius: '12px' }}
                                    />
                                </div>

                                {/* Row 4: Reason Textarea */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Reason for Leave *</label>
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
                                            borderRadius: '12px'
                                        }}
                                        placeholder="Please explain the reason for your leave request..."
                                    />
                                </div>
                            </>
                        )}

                        {/* Row 5: Submit Button Align Right */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <Button
                                type="submit"
                                isLoading={isSubmitting}
                                variant="submit-premium"
                                style={{
                                    paddingLeft: '2.5rem',
                                    paddingRight: '2.5rem',
                                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)' }}
                            >
                                Submit Leave
                            </Button>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </Layout>
    );
};

export default ApplyLeave;
