import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { showSuccessToast, showErrorToast } from '../utils/alert';

const AuthContext = createContext();

// EXPORT #1: The Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            const { data } = await api.post('/users/login', { email, password });
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            showSuccessToast('ចូលប្រើបានជោគជ័យ!');
            navigate('/');
        } catch (error) {
            const message = error.response?.data?.message || 'មានបញ្ហាពេលចូលប្រើ';
            showErrorToast(message);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// EXPORT #2: The Custom Hook
export const useAuth = () => {
    return useContext(AuthContext);
};