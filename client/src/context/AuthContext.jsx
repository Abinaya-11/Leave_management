import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_URL from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in localStorage on load
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            const userData = res.data;
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', userData.token);
            setUser(userData);
            return userData;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (name, email, password, role, department, register_no, student_type, hostel_name, floor, room_no) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/register`, {
                name, email, password, role, department, register_no, student_type, hostel_name, floor, room_no
            });
            // Registration successful, usually redirects to login, so no need to set user immediately unless auto-login
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = (data) => {
        const newUser = { ...user, ...data };
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
