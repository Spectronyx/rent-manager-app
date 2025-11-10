// File: frontend/src/components/admin/PendingBillsList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getPendingBills } from '../../api/billApi';
import { confirmPayment } from '../../api/paymentApi';

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

const PendingBillsList = () => {
    // All this logic is 100% unchanged
    const [bills, setBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPending = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getPendingBills();
            setBills(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const handleConfirm = async (billId, amount) => {
        if (window.confirm('Have you received this payment in your bank account?')) {
            try {
                await confirmPayment(billId, amount, 'UPI');
                fetchPending();
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        }
    };

    // 2. Add styled loading/error messages
    if (isLoading) {
        return <p className="text-muted-foreground">Loading pending payments...</p>;
    }
    if (error) {
        return <p className="text-destructive">Error: {error}</p>;
    }

    // 3. This is the new, styled JSX
    return (
        <div>
            {/* We can use Tailwind typography on the title */}
            <h3 className="text-xl font-semibold mb-4">
                Payments Awaiting Confirmation
            </h3>
            {bills.length === 0 ? (
                <p className="text-muted-foreground">
                    No payments are currently awaiting your confirmation.
                </p>
            ) : (
                // 4. Use a grid for a nice card layout
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bills.map((bill) => (
                        // 5. Replace the old <div> with a <Card>
                        // We use Tailwind's 'border-yellow-500' to keep the pending look
                        <Card key={bill._id} className="border-yellow-500 border-2">
                            <CardHeader>
                                <CardTitle>
                                    {bill.tenantId.name}
                                </CardTitle>
                                <CardDescription>
                                    Room: {bill.roomId.roomNumber}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    ₹{bill.totalAmount}
                                </p>
                            </CardContent>
                            <CardFooter>
                                {/* 6. Replace the old <button> with our styled Button */}
                                <Button
                                    className="w-full"
                                    onClick={() => handleConfirm(bill._id, bill.totalAmount)}
                                >
                                    Confirm Payment
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

// 7. We can now delete the old 'billItemStyle' object
// const billItemStyle = { ... };

export default PendingBillsList;