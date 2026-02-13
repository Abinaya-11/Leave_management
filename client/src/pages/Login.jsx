import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FaEnvelope, FaLock, FaSignInAlt, FaLeaf } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = await login(email, password);
            addToast(`Welcome back, ${user.name}!`, 'success');
            if (user.role === 'student') {
                navigate('/student-dashboard');
            } else if (user.role === 'faculty') {
                navigate('/faculty-dashboard');
            } else if (user.role === 'admin') {
                navigate('/admin-dashboard');
            }
        } catch (err) {
            const errorMessage = err.message || 'Login failed. Please check your credentials.';
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Background Orbs */}
            <div className="bg-orb orb-1"></div>
            <div className="bg-orb orb-2"></div>

            <div className="glass-card login-card">
                <div className="auth-header">
                    <div className="auth-logo-icon">
                        <FaLeaf />
                    </div>
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to manage your leaves</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-field-container">
                        <input
                            type="email"
                            className="glass-input"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <FaEnvelope className="input-icon" />
                    </div>

                    <div className="input-field-container">
                        <input
                            type="password"
                            className="glass-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <FaLock className="input-icon" />
                    </div>

                    <button
                        type="submit"
                        className="glass-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            'Signing in...'
                        ) : (
                            <>
                                Login <FaSignInAlt />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?
                        <Link to="/register" className="auth-redirect-link">
                            Register now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};


export default Login;
