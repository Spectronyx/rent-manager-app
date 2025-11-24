import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
    Menu,
    Home,
    History,
    LogOut,
    User,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    const navLinks = user ? [
        { to: '/dashboard', label: 'Dashboard', icon: Home },
        { to: '/financials', label: 'Financials', icon: DollarSign },
        { to: '/payments', label: 'Payments', icon: Calendar },
        { to: '/history', label: 'History', icon: History },
    ] : [
        { to: '/login', label: 'Login', icon: User },
    ];

    return (
        <motion.nav
            className="sticky top-0 z-50 glass-card border-b border-cyan-500/20"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        to={user ? '/dashboard' : '/'}
                        className="flex items-center gap-2 group"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <motion.div
                            className="relative"
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Sparkles className="h-6 w-6 text-cyan-400" />
                            <motion.div
                                className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                        </motion.div>
                        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                            Rent Manager
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link, idx) => {
                            const Icon = link.icon;
                            return (
                                <motion.div
                                    key={link.to}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Link
                                        to={link.to}
                                        className="group relative px-4 py-2 text-sm font-medium text-foreground/80 transition-all hover:text-cyan-400"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Icon className="h-4 w-4" />
                                            {link.label}
                                        </span>
                                        <motion.div
                                            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500"
                                            initial={{ width: 0 }}
                                            whileHover={{ width: '100%' }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </Link>
                                </motion.div>
                            );
                        })}

                        {user && (
                            <>
                                <Separator orientation="vertical" className="h-6 bg-cyan-500/20" />
                                <motion.div
                                    className="flex items-center gap-3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Avatar className="h-8 w-8 ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-background">
                                        <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-purple-500 text-white text-xs">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground">
                                        {user.name}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="relative group overflow-hidden"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20"
                                            initial={{ x: '-100%' }}
                                            whileHover={{ x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </Button>
                                </motion.div>
                            </>
                        )}
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative group"
                                >
                                    <Menu className="h-5 w-5" />
                                    <motion.div
                                        className="absolute inset-0 rounded-md bg-cyan-400/10"
                                        initial={{ scale: 0 }}
                                        whileTap={{ scale: 1.2 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="glass-card border-l border-cyan-500/20">
                                <SheetHeader>
                                    <SheetTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                                        Rent Manager
                                    </SheetTitle>
                                    <SheetDescription>
                                        {user ? `Welcome, ${user.name}` : 'Please log in'}
                                    </SheetDescription>
                                </SheetHeader>
                                <Separator className="my-4 bg-cyan-500/20" />
                                <nav className="flex flex-col gap-4">
                                    {navLinks.map((link, idx) => {
                                        const Icon = link.icon;
                                        return (
                                            <motion.div
                                                key={link.to}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                            >
                                                <Link
                                                    to={link.to}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-all hover:bg-cyan-400/10 hover:text-cyan-400"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                    {link.label}
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                    {user && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <Button
                                                variant="destructive"
                                                className="w-full"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Logout
                                            </Button>
                                        </motion.div>
                                    )}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;