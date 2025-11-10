// File: frontend/src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// 1. Import all the Shadcn components
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const RegisterPage = () => {
    // All this state and logic is unchanged
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const success = await register(name, email, password, phone);
            if (success) {
                navigate('/dashboard');
            } else {
                setError('Registration failed. Email might already be in use.');
            }
        } catch (err) {
            setError('Registration failed. Please try again.');
        }
    };

    // 2. This is the new, styled JSX
    return (
        // Use Tailwind to center the card
        <div className="flex items-center justify-center min-h-[80vh] py-8">
            <Card className="w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="text-2xl">Create an Account</CardTitle>
                        <CardDescription>
                            Enter your details to register.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Form field for Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        {/* Form field for Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        {/* Form field for Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="1234567890"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        {/* Form field for Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {/* Form field for Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        {/* Styled error message */}
                        {error && (
                            <p className="text-sm font-medium text-red-500">{error}</p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">
                            Register
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default RegisterPage;