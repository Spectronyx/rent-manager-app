// File: frontend/src/components/student/MyPaymentHistory.jsx

import React, { useState, useEffect } from 'react';
import { getMyPayments } from '../../api/paymentApi';

// 1. Import our Shadcn components
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge'; // Let's use a badge for status

const MyPaymentHistory = () => {
    // All this logic is 100% unchanged
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getMyPayments();
                setPayments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // 2. This is the new, styled JSX
    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Payment History</CardTitle>
                <CardDescription>
                    A record of all your confirmed payments.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* 3. Replaced <ul> with <Table> */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Bill (Month/Year)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Loading payment history...
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-24 text-center text-destructive"
                                >
                                    Error: {error}
                                </TableCell>
                            </TableRow>
                        ) : payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No confirmed payments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map((payment) => (
                                <TableRow key={payment._id}>
                                    <TableCell>
                                        {new Date(payment.paymentDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {payment.billId?.month}/{payment.billId?.year}
                                    </TableCell>
                                    <TableCell>
                                        {/* 4. Use a styled Badge for the status */}
                                        <Badge variant="outline" className="text-green-600">
                                            {payment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ₹{payment.amount}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};


export default MyPaymentHistory;