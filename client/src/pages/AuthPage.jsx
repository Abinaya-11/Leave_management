import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    FaEnvelope, FaLock, FaSignInAlt, FaGraduationCap, FaUser,
    FaBuilding, FaUserPlus, FaChevronDown, FaHotel,
    FaDoorOpen, FaIdCard
} from 'react-icons/fa';
import './Auth.css';

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register } = useAuth();
    const { addToast } = useToast();

    // Determine initial mode from URL
    const [isRegister, setIsRegister] = useState(location.pathname === '/register');
    const [isLoading, setIsLoading] = useState(false);

    // Login States
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register States
    const [regData, setRegData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        department: '',
        register_no: '',
        student_type: 'Hosteller',
        hostel_name: '',
        floor: '',
        room_no: ''
    });

    // Update state when URL changes (e.g., back button)
    useEffect(() => {
        setIsRegister(location.pathname === '/register');
    }, [location.pathname]);

    const handleToggle = () => {
        const newMode = !isRegister;
        setIsRegister(newMode);
        navigate(newMode ? '/register' : '/login');
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = await login(loginEmail, loginPassword);
            addToast(`Welcome back, ${user.name}!`, 'success');
            const paths = {
                student: '/student-dashboard',
                faculty: '/faculty-dashboard',
                admin: '/admin-dashboard',
                placement_cell: '/placement-cell-dashboard',
                clubs_coordinator: '/clubs-dashboard',
                iecc: '/iecc-dashboard'
            };
            navigate(paths[user.role] || '/');
        } catch (err) {
            addToast(err.message || 'Login failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegChange = (e) => {
        setRegData({ ...regData, [e.target.name]: e.target.value });
    };

    const handleRegSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(
                regData.name, regData.email, regData.password, regData.role,
                regData.department, regData.register_no, regData.student_type,
                regData.hostel_name, regData.floor, regData.room_no
            );
            addToast('Registration successful! Please login.', 'success');
            handleToggle(); // Switch to login mode
        } catch (err) {
            addToast(err.message || 'Registration failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`auth-page-wrapper ${isRegister ? 'register-mode-active' : ''}`}>
            <div className="auth-main-container" id="auth-main-container">

                {/* Sign Up Form Container */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleRegSubmit} className="auth-form-content">
                        <div className="auth-form-card">
                            <div className="auth-header">
                                <div className="auth-logo-icon reg-icon">
                                    <FaUserPlus />
                                </div>
                                <h2 className="auth-title">Create Account</h2>
                                <p className="auth-subtitle">Join our platform and manage leaves efficiently</p>
                            </div>

                            <div className="grid-cols-2">
                                <div className="input-field-container">
                                    <input type="text" name="name" className="glass-input" placeholder=" " value={regData.name} onChange={handleRegChange} required />
                                    <FaUser className="input-icon" />
                                    <label className="auth-floating-label">Full Name</label>
                                </div>
                                {regData.role === 'student' && (
                                    <div className="input-field-container">
                                        <input type="text" name="register_no" className="glass-input" placeholder=" " value={regData.register_no} onChange={handleRegChange} required />
                                        <FaIdCard className="input-icon" />
                                        <label className="auth-floating-label">Register No *</label>
                                    </div>
                                )}
                                <div className="input-field-container">
                                    <input type="email" name="email" className="glass-input" placeholder=" " value={regData.email} onChange={handleRegChange} required />
                                    <FaEnvelope className="input-icon" />
                                    <label className="auth-floating-label">Email Address</label>
                                </div>
                                <div className="input-field-container">
                                    <input type="password" name="password" className="glass-input" placeholder=" " value={regData.password} onChange={handleRegChange} required />
                                    <FaLock className="input-icon" />
                                    <label className="auth-floating-label">Password</label>
                                </div>
                                <div className="input-field-container select-wrapper">
                                    <select name="role" className="glass-input" value={regData.role} onChange={handleRegChange}>
                                        <option value="student">Student</option>
                                        <option value="faculty">Faculty</option>
                                        <option value="admin">Admin</option>
                                        <option value="placement_cell">Placement Cell</option>
                                        <option value="clubs_coordinator">Clubs Coordinator</option>
                                        <option value="iecc">IECC</option>
                                    </select>
                                    <FaChevronDown className="select-arrow" />
                                </div>
                                <div className="input-field-container">
                                    <input type="text" name="department" className="glass-input" placeholder=" " value={regData.department} onChange={handleRegChange} />
                                    <FaBuilding className="input-icon" />
                                    <label className="auth-floating-label">Department</label>
                                </div>
                            </div>

                            {regData.role === 'student' && (
                                <div className="student-extra-fields">
                                    <div className="grid-cols-2" style={{ marginTop: '1rem' }}>
                                        <div className="input-field-container select-wrapper">
                                            <select name="student_type" className="glass-input" value={regData.student_type} onChange={handleRegChange} required>
                                                <option value="Hosteller">Hosteller</option>
                                                <option value="Dayscholar">Dayscholar</option>
                                            </select>
                                            <FaChevronDown className="select-arrow" />
                                        </div>
                                        {regData.student_type === 'Hosteller' && (
                                            <div className="input-field-container">
                                                <input type="text" name="hostel_name" className="glass-input" placeholder="Hostel Name *" value={regData.hostel_name} onChange={handleRegChange} required />
                                                <FaHotel className="input-icon" />
                                            </div>
                                        )}
                                    </div>
                                    {regData.student_type === 'Hosteller' && (
                                        <div className="grid-cols-2" style={{ marginTop: '1rem' }}>
                                            <div className="input-field-container select-wrapper">
                                                <select name="floor" className="glass-input" value={regData.floor} onChange={handleRegChange} required>
                                                    <option value="">Select Floor *</option>
                                                    <option value="First Floor">First Floor</option>
                                                    <option value="Second Floor">Second Floor</option>
                                                    <option value="Third Floor">Third Floor</option>
                                                </select>
                                                <FaChevronDown className="select-arrow" />
                                            </div>
                                            <div className="input-field-container">
                                                <input type="text" name="room_no" className="glass-input" placeholder="Room No *" value={regData.room_no} onChange={handleRegChange} required />
                                                <FaDoorOpen className="input-icon" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button type="submit" className="glass-button" disabled={isLoading}>
                                {isLoading ? 'Processing...' : <><FaUserPlus /> Register</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sign In Form Container */}
                <div className="form-container sign-in-container">
                    <form onSubmit={handleLoginSubmit} className="auth-form-content">
                        <div className="auth-form-card">
                            <div className="auth-header">
                                <div className="auth-logo-icon login-icon">
                                    <FaGraduationCap />
                                </div>
                                <h2 className="auth-title">Welcome Back</h2>
                                <p className="auth-subtitle">Sign in to manage your leaves</p>
                            </div>

                            <div className="input-field-container">
                                <input type="email" className="glass-input" placeholder=" " value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                                <FaEnvelope className="input-icon" />
                                <label className="auth-floating-label">Email Address</label>
                            </div>

                            <div className="input-field-container">
                                <input type="password" className="glass-input" placeholder=" " value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                                <FaLock className="input-icon" />
                                <label className="auth-floating-label">Password</label>
                            </div>

                            <button type="submit" className="glass-button" disabled={isLoading}>
                                {isLoading ? 'Processing...' : <>Login <FaSignInAlt /></>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Overlay Container */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your personal info</p>
                            <button className="ghost-button" onClick={handleToggle}>Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Join the Leave Management System</h1>
                            <p>Create your account to submit leave requests and stay updated with approvals.</p>
                            <button className="ghost-button" onClick={handleToggle}>Register</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
