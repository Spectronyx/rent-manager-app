// File: frontend/src/components/admin/CreateRoomForm.jsx

import React, { useState } from 'react';
import { createRoom } from '../../api/roomApi';

// 1. Import our Shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CreateRoomForm = ({ buildingId, onRoomCreated }) => {
    // All this logic is 100% unchanged
    const [roomNumber, setRoomNumber] = useState('');
    const [monthlyRent, setMonthlyRent] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!roomNumber || !monthlyRent) {
            setError('Both fields are required.');
            return;
        }

        try {
            const roomData = {
                roomNumber,
                monthlyRent: Number(monthlyRent),
                buildingId,
            };
            await createRoom(roomData);
            setMessage(`Room ${roomNumber} created!`);
            setRoomNumber('');
            setMonthlyRent('');
            if (onRoomCreated) {
                onRoomCreated();
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // 2. This is the new, styled JSX
    return (
        // We use Tailwind classes for layout, including a responsive grid
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Room Number Field */}
                <div className="space-y-2">
                    <Label htmlFor="roomNumber">Room Number (e.g., 101-A)</Label>
                    <Input
                        id="roomNumber"
                        type="text"
                        placeholder="101-A"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        required
                    />
                </div>
                {/* Monthly Rent Field */}
                <div className="space-y-2">
                    <Label htmlFor="monthlyRent">Monthly Rent (₹)</Label>
                    <Input
                        id="monthlyRent"
                        type="number"
                        placeholder="0.00"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                        required
                    />
                </div>
            </div>
            {/* Styled messages */}
            {message && (
                <p className="text-sm font-medium text-green-600">{message}</p>
            )}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit">Create Room</Button>
        </form>
    );
};

export default CreateRoomForm;