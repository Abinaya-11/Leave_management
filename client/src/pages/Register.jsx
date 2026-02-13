import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaUserPlus, FaChevronDown } from 'react-icons/fa';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        department: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(formData.name, formData.email, formData.password, formData.role, formData.department);
            addToast('Registration successful! Please login.', 'success');
            navigate('/login');
        } catch (err) {
            addToast(err.message || 'Registration failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Background Orbs */}
            <div className="bg-orb orb-1"></div>
            <div className="bg-orb orb-2"></div>

            <div className="glass-card register-card">
                <div className="auth-header">
                    <div className="auth-logo-icon">
                        <FaUserPlus />
                    </div>
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Join our platform and manage leaves efficiently</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="grid-cols-2">
                        <div className="input-field-container">
                            <input
                                type="text"
                                name="name"
                                className="glass-input"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <FaUser className="input-icon" />
                        </div>

                        <div className="input-field-container">
                            <input
                                type="email"
                                name="email"
                                className="glass-input"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <FaEnvelope className="input-icon" />
                        </div>

                        <div className="input-field-container">
                            <input
                                type="password"
                                name="password"
                                className="glass-input"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <FaLock className="input-icon" />
                        </div>

                        <div className="input-field-container select-wrapper">
                            <select
                                name="role"
                                className="glass-input"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="admin">Admin</option>
                            </select>
                            <FaChevronDown className="select-arrow" />
                        </div>

                        <div className="input-field-container sm:col-span-2">
                            <input
                                type="text"
                                name="department"
                                className="glass-input"
                                placeholder="Department (e.g. CS)"
                                value={formData.department}
                                onChange={handleChange}
                            />
                            <FaBuilding className="input-icon" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="glass-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : (
                            <>Register <FaUserPlus /></>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?
                        <Link to="/login" className="auth-redirect-link">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
