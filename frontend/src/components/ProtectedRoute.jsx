import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // You can show a loading spinner here while checking auth state
        return <div>Loading...</div>;
    }

    // If a user exists and their role is in the allowed list, show the page.
    // Otherwise, redirect them to the home page.
    return user && allowedRoles.includes(user.role) ? (
        <Outlet />
    ) : (
        <Navigate to="/" replace />
    );
};

export default ProtectedRoute;