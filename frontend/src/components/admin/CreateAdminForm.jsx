// File: frontend/src/components/admin/CreateAdminForm.jsx

import React, { useState } from 'react';
import { createAdmin } from '../../api/userApi';

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

const CreateAdminForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const newUser = await createAdmin({ name, email, password, phone });
            setMessage(`Admin user ${newUser.name} created successfully!`);
            // Clear form
            setName('');
            setEmail('');
            setPhone('');
            setPassword('');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Create New Admin</CardTitle>
                    <CardDescription>
                        This will create a new user with full admin privileges.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="new-admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Temporary Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {message && (
                        <p className="text-sm font-medium text-green-600">{message}</p>
                    )}
                    {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                </CardContent>
                <CardFooter>
                    <Button type="submit">Create Admin User</Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default CreateAdminForm;