// File: frontend/src/components/admin/UpdateBillForm.jsx

import React, { useState } from 'react';
import { updateBillCharges } from '../../api/billApi';

// 1. Import our Shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// This component receives a single 'bill' object as a prop
const UpdateBillForm = ({ bill }) => {
    const [electricity, setElectricity] = useState(bill.electricityBill || 0);
    const [other, setOther] = useState(bill.otherCharges || 0);
    const [message, setMessage] = useState('');

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await updateBillCharges(bill._id, {
                electricityBill: Number(electricity),
                otherCharges: Number(other),
            });
            setMessage('Saved!');
            // Hide "Saved!" message after 2 seconds
            setTimeout(() => setMessage(''), 2000);
        } catch (error) { // <-- 2. THIS IS THE FIX
            setMessage('Failed to save.');
        } // <-- 2. THIS IS THE FIX
    };

    // 3. This is the new, styled JSX
    return (
        // Replaced the style object with Tailwind classes
        <form
            onSubmit={handleSave}
            className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg mb-4"
        >
            {/* Tenant & Room Info */}
            <div className="flex flex-col">
                <span className="font-bold">{bill.roomId.roomNumber}</span>
                <span className="text-sm text-muted-foreground">
                    {bill.tenantId.name}
                </span>
            </div>

            {/* Base Rent */}
            <div className="flex flex-col">
                <Label className="text-sm text-muted-foreground">Rent</Label>
                <span className="font-medium">₹{bill.rent}</span>
            </div>

            {/* Electricity Input */}
            <div className="space-y-2">
                <Label htmlFor={`electricity-${bill._id}`}>Electricity</Label>
                <div className="flex items-center gap-1">
                    <span>₹</span>
                    <Input
                        id={`electricity-${bill._id}`}
                        type="number"
                        value={electricity}
                        onChange={(e) => setElectricity(e.target.value)}
                        className="w-24" // Gave it a fixed width
                    />
                </div>
            </div>

            {/* Other Charges Input */}
            <div className="space-y-2">
                <Label htmlFor={`other-${bill._id}`}>Other</Label>
                <div className="flex items-center gap-1">
                    <span>₹</span>
                    <Input
                        id={`other-${bill._id}`}
                        type="number"
                        value={other}
                        onChange={(e) => setOther(e.target.value)}
                        className="w-24" // Gave it a fixed width
                    />
                </div>
            </div>

            {/* Save Button & Message */}
            <div className="flex items-center gap-2">
                <Button type="submit" size="sm">Save</Button>
                {message && (
                    <small className="text-sm font-medium text-green-600">
                        {message}
                    </small>
                )}
            </div>
        </form>
    );
};

export default UpdateBillForm;