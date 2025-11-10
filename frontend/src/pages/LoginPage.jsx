// File: frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// 1. Import all the Shadcn components we'll use
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

const LoginPage = () => {
    // 3. Form state (This is all unchanged)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // 4. Get functions from our hooks (Unchanged)
    const { login } = useAuth();
    const navigate = useNavigate();

    // 5. Handle form submission (Unchanged)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const success = await login(email, password);

            if (success) {
                navigate('/dashboard');
            } else {
                setError('Invalid email or password. Please try again.');
            }
        } catch (err) {
            setError('Login failed. Please try again later.');
        }
    };

    // 6. This is the new, styled JSX
    return (
        // We use Tailwind classes to center the card on the page
        <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="text-2xl">Login</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Form field for Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                        {/* Styled error message */}
                        {error && (
                            <p className="text-sm font-medium text-red-500">{error}</p>
                        )}
                    </CardContent>
                    <CardFooter>
                        {/* Full-width button */}
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default LoginPage;