import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import API_URL from '../config';
import Layout from '../components/shared/Layout';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import { FaUser, FaEdit, FaSave, FaTimes, FaGraduationCap, FaUserTie, FaBuilding, FaHotel, FaPhone, FaEnvelope, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { addToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        register_no: '',
        faculty_id: '',
        department: '',
        year: '',
        hostel_name: '',
        floor: '',
        room_no: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                register_no: user.register_no || user.registerNo || '',
                faculty_id: user.faculty_id || '',
                department: user.department || '',
                year: user.year || '',
                hostel_name: user.hostel_name || '',
                floor: user.floor || '',
                room_no: user.room_no || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await axios.put(`${API_URL}/api/users/profile`, formData);
            if (res.data.success) {
                updateUser(res.data.user);
                addToast('Profile updated successfully', 'success');
                setIsEditing(false);
            }
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    const isStudent = user.role === 'student';

    const renderField = (label, value, icon, name, editable = true) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>
                {icon} {label}
            </label>
            {isEditing && editable ? (
                <input
                    type="text"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-main)',
                        fontSize: '1rem'
                    }}
                />
            ) : (
                <div style={{ 
                    padding: '0.75rem 1rem', 
                    borderRadius: '10px', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-main)',
                    fontWeight: '600'
                }}>
                    {value || 'Not provided'}
                </div>
            )}
        </div>
    );

    return (
        <Layout title="Profile">
            <div className="fade-in" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                <GlassCard style={{ padding: '2.5rem', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ 
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '20px', 
                                background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '2rem',
                                boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)'
                            }}>
                                {isStudent ? <FaGraduationCap /> : <FaUserTie />}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.75rem' }}>{user.name}</h2>
                                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: '500' }}>{user.role} Portal</p>
                            </div>
                        </div>
                        
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="btn"
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem', 
                                    background: '#0ea5e9', 
                                    color: 'white',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaEdit /> Edit Profile
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem', 
                                        background: 'var(--danger-light)', 
                                        color: 'var(--danger)',
                                        padding: '0.75rem 1.2rem',
                                        borderRadius: '10px',
                                        border: 'none',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FaTimes /> Cancel
                                </button>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem', 
                                        background: '#0ea5e9', 
                                        color: 'white',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '10px',
                                        border: 'none',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FaSave /> {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {renderField('Full Name', formData.name, <FaUser />, 'name')}
                            {renderField('Email Address', formData.email, <FaEnvelope />, 'email', false)}
                            
                            {isStudent ? (
                                <>
                                    {renderField('Register Number', formData.register_no, <FaGraduationCap />, 'register_no', false)}
                                    {renderField('Department', formData.department, <FaBuilding />, 'department', false)}
                                    {renderField('Year', formData.year, <FaCalendarAlt />, 'year')}
                                    {renderField('Phone Number', formData.phone_number, <FaPhone />, 'phone_number')}
                                    
                                    {user.student_type?.toUpperCase() === 'HOSTELLER' && (
                                        <>
                                            {renderField('Hostel Name', formData.hostel_name, <FaHotel />, 'hostel_name', false)}
                                            {renderField('Floor', formData.floor, <FaHotel />, 'floor', false)}
                                        </>
                                    )}
                                    
                                    {renderField('Mentor Name', user.mentor_name, <FaUserTie />, '', false)}
                                    {user.student_type?.toUpperCase() === 'HOSTELLER' && (
                                        renderField('Warden Name', user.warden_name, <FaUserTie />, '', false)
                                    )}
                                </>
                            ) : (
                                <>
                                    {renderField('Faculty ID', formData.faculty_id, <FaUserTie />, 'faculty_id', false)}
                                    {renderField('Department', formData.department, <FaBuilding />, 'department', false)}
                                    {renderField('Phone Number', formData.phone_number, <FaPhone />, 'phone_number')}
                                    {renderField('Role', user.role, <FaCheckCircle />, '', false)}
                                </>
                            )}
                        </div>
                    </form>
                </GlassCard>
            </div>
        </Layout>
    );
};

export default Profile;
