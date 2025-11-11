// File: frontend/src/components/admin/BillManager.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { generateBills, getPendingBillsForBuilding } from '../../api/billApi';
import UpdateBillForm from './UpdateBillForm'; // This is already styled!

// 1. Import all our Shadcn components
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
import { Separator } from '@/components/ui/separator';

const BillManager = ({ buildingId }) => {
    // All this state and logic is 100% unchanged
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [pendingBills, setPendingBills] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPendingBills = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getPendingBillsForBuilding(buildingId);
            setPendingBills(res.data);
        } catch (err) {
            setError('Could not load pending bills');
        }
        setIsLoading(false);
    }, [buildingId]);

    useEffect(() => {
        fetchPendingBills();
    }, [fetchPendingBills]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (!month || !year) {
            setError('Please select a valid month and year.');
            return;
        }
        try {
            const res = await generateBills(buildingId, Number(month), Number(year));
            setMessage(res.message);
            fetchPendingBills();
        } catch (err) {
            setError(err.message);
        }
    };

    // 2. This is the new, styled JSX
    return (
        <div className="space-y-6">
            {/* --- Card 1: Generate Bills --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Generate Monthly Bills</CardTitle>
                    <CardDescription>
                        This will create a new, pending bill for every "Occupied" room in
                        this building for the selected month.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleGenerate} className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="month">Month</Label>
                            <Input
                                type="number"
                                id="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                min="1"
                                max="12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year">Year</Label>
                            <Input
                                type="number"
                                id="year"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                min="2020"
                            />
                        </div>
                        <Button type="submit" className="self-end">
                            Generate Bills
                        </Button>
                    </form>
                    {/* Styled messages */}
                    {message && (
                        <p className="mt-4 text-sm font-medium text-green-600">{message}</p>
                    )}
                    {error && (
                        <p className="mt-4 text-sm font-medium text-destructive">{error}</p>
                    )}
                </CardContent>
            </Card>

            <Separator />

            {/* --- Card 2: Pending Bills List --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Manage Pending Bills</CardTitle>
                    <CardDescription>
                        Add electricity/other charges below. The student will see the new
                        total instantly.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-muted-foreground">Loading pending bills...</p>
                    ) : pendingBills.length > 0 ? (
                        <div className="space-y-4">
                            {pendingBills.map((bill) => (
                                <UpdateBillForm key={bill._id} bill={bill} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">
                            No pending bills found for this building.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};


export default BillManager;