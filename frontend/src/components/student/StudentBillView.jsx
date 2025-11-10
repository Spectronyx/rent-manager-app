// File: frontend/src/components/student/StudentBillView.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getMyCurrentBill, markBillAsPaid } from '../../api/billApi';

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
import { Separator } from '@/components/ui/separator';

const StudentBillView = () => {
    // All this logic is 100% unchanged
    const [bill, setBill] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchBill = useCallback(async () => {
        try {
            setIsLoading(true);
            setError('');
            setMessage('');
            const data = await getMyCurrentBill();
            setBill(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBill();
    }, [fetchBill]);

    const handleMarkAsPaid = async () => {
        if (!bill || bill.status !== 'Pending') return;
        if (
            window.confirm(
                'Have you completed the payment via UPI? This will notify the admin.'
            )
        ) {
            try {
                const res = await markBillAsPaid(bill._id);
                setMessage(res.message);
                fetchBill();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    // 2. Styled loading/error states
    if (isLoading) {
        return <p className="text-muted-foreground">Loading your bill details...</p>;
    }

    if (error) {
        return <p className="text-destructive">Error: {error}</p>;
    }

    // 3. Styled "No Bill" state
    if (!bill) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-lg font-medium text-green-600">
                        You have no outstanding bills. You're all paid up!
                    </p>
                </CardContent>
            </Card>
        );
    }

    // 4. This is the new, styled JSX for the bill
    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Your Current Bill</CardTitle>
                <CardDescription>
                    For {bill.month}/{bill.year} (Room: {bill.roomId?.roomNumber || 'N/A'})
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Itemized List */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Rent:</span>
                        <span>₹{bill.rent}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Electricity:</span>
                        <span>₹{bill.electricityBill}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Other Charges:</span>
                        <span>₹{bill.otherCharges}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Previous Dues:</span>
                        <span>₹{bill.previousDues}</span>
                    </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary">
                        ₹{bill.totalAmount}
                    </span>
                </div>

                {/* Status */}
                <div className="text-center pt-2">
                    <p className="font-semibold">
                        Status: <span className="text-primary">{bill.status}</span>
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                {/* 5. Show button or status messages */}
                {bill.status === 'Pending' && (
                    <Button onClick={handleMarkAsPaid} className="w-full">
                        I have paid (Mark for Confirmation)
                    </Button>
                )}

                {bill.status === 'PaymentPendingConfirmation' && (
                    <p className="text-sm font-medium text-yellow-600">
                        Payment is pending admin confirmation.
                    </p>
                )}

                {bill.status === 'Paid' && (
                    <p className="text-sm font-medium text-green-600">
                        This bill has been paid.
                    </p>
                )}

                {message && (
                    <p className="text-sm font-medium text-green-600">{message}</p>
                )}
            </CardFooter>
        </Card>
    );
};



export default StudentBillView;