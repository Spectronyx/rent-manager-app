import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;
