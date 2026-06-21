import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // <-- CORRECT: Import the useAuth hook
import Loading from './Loading';

const PrivateRoute = ({ children }) => {
    // Call the hook to get the authentication state
    const { isAuthenticated, loading } = useAuth();

    // If the authentication state is still loading, show a loading screen
    if (loading) {
        return <Loading fullScreen />;
    }

    // If authenticated, show the requested page. Otherwise, redirect to the login page.
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;