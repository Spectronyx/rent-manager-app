// File: frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// This component will "wrap" any page we want to protect.
// It receives the page (as 'children') from App.jsx
const ProtectedRoute = ({ children }) => {
    // 1. Check if the user is logged in
    const { user } = useAuth();

    if (!user) {
        // 2. If no user, redirect them to the /login page
        // The 'replace' prop is good practice: it prevents
        // the user from hitting the "back" button and
        // getting stuck in a redirect loop.
        return <Navigate to="/login" replace />;
    }

    // 3. If a user exists, show the page they asked for!
    return children;
};

export default ProtectedRoute;