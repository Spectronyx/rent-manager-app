// File: frontend/src/components/Navbar.jsx

import React, { useState } from 'react'; // 1. Import useState
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Button } from '@/components/ui/button';

// 2. Import our new components
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Menu } from 'lucide-react'; // Our hamburger icon

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // 3. Add state to control the mobile menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMobileMenuOpen(false); // Close menu on logout
    };

    return (
        <nav className="flex items-center justify-between p-4 border-b bg-background">
            <Link
                to={user ? '/dashboard' : '/'}
                className="text-xl font-bold"
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on logo click
            >
                <h1>Rent Manager</h1>
            </Link>

            {/* 4. --- DESKTOP NAV --- */}
            {/* 'hidden' by default, 'md:flex' (flex) on medium screens and up */}
            <div className="hidden md:flex items-center gap-6">
                {user ? (
                    // Logged-in desktop links
                    <>
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
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            Logout
                        </Button>
                    </>
                ) : (
                    // Logged-out desktop links
                    <>
                        <Link to="/login" className="text-sm font-medium text-primary">
                            Login
                        </Link>
                        <Link to="/register" className="text-sm font-medium text-primary">
                            Register
                        </Link>
                    </>
                )}
            </div>

            {/* 5. --- MOBILE NAV (Hamburger Menu) --- */}
            {/* 'md:hidden' (hidden on medium screens and up) so it only shows on mobile */}
            <div className="md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Rent Manager</SheetTitle>
                            <SheetDescription>
                                {user ? `Welcome, ${user.name}` : 'Please log in'}
                            </SheetDescription>
                        </SheetHeader>
                        <Separator className="my-4" />
                        {/* 6. Navigation links *inside* the drawer */}
                        <nav className="flex flex-col gap-4">
                            {user ? (
                                // Logged-in mobile links
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="text-lg font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/history"
                                        className="text-lg font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        History
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                // Logged-out mobile links
                                <>
                                    <Link
                                        to="/login"
                                        className="text-lg font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="text-lg font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
};

export default Navbar;