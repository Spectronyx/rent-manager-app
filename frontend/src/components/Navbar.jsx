// File: frontend/src/components/Navbar.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // Our auth "brain"
import { Button } from '@/components/ui/button'; // 1. Import the Shadcn Button

const Navbar = () => {
    // Get the user and logout function (Unchanged)
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // handleLogout logic (Unchanged)
    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect to login page after logout
    };

    // 2. We've replaced all 'style={...}' with Tailwind classes
    return (
        <nav className="flex items-center justify-between p-4 border-b bg-background">
            {/* 3. Styled the main title */}
            <Link to="/" className="text-xl font-bold">
                <h1>Rent Manager</h1>
            </Link>

            {/* 4. Styled the navigation links container */}
            <div className="flex items-center gap-6">
                {user ? (
                    // If user is logged in
                    <>
                        {/* 5. Added a link to the dashboard */}
                        <Link
                            to="/dashboard"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/history"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            History
                        </Link>
                        <span className="text-sm">Hello, {user.name}</span>
                        {/* 6. Used the Shadcn Button for logout */}
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            Logout
                        </Button>
                    </>
                ) : (
                    // If user is logged out
                    <>
                        <Link
                            to="/login"
                            className="text-sm font-medium text-primary"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm font-medium text-primary"
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};



export default Navbar;