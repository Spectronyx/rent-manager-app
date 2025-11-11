// File: frontend/src/components/admin/CreateBuildingForm.jsx

import React, { useState } from 'react';
import { createBuilding } from '../../api/buildingApi';

// 1. Import our Shadcn components
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

const CreateBuildingForm = ({ onBuildingCreated }) => {
    // All this logic is 100% unchanged
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (onBuildingCreated) {
            onBuildingCreated();
        }

        try {
            const newBuilding = await createBuilding({ name, address });
            setMessage(`Building created: ${newBuilding.name}`);
            setName('');
            setAddress('');

            // 2. THIS IS THE FIX: Call the parent's function!
            if (onBuildingCreated) {
                onBuildingCreated();
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // 2. This is the new, styled JSX
    return (
        // We'll use a Card, but 'w-full' so it fits the dashboard layout
        <Card className="w-full">
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Create a New Building</CardTitle>
                    <CardDescription>
                        Add a new property to your management list.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Form field for Building Name */}
                    <div className="space-y-2">
                        <Label htmlFor="buildingName">Building Name</Label>
                        <Input
                            id="buildingName"
                            type="text"
                            placeholder="e.g., Green Valley Apartments"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    {/* Form field for Address */}
                    <div className="space-y-2">
                        <Label htmlFor="buildingAddress">Address</Label>
                        <Input
                            id="buildingAddress"
                            type="text"
                            placeholder="e.g., 123 Main St"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>
                    {/* Styled success/error messages */}
                    {message && (
                        <p className="text-sm font-medium text-green-600">{message}</p>
                    )}
                    {error && (
                        <p className="text-sm font-medium text-destructive">{error}</p>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit">Add Building</Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default CreateBuildingForm;