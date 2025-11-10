// File: frontend/src/components/admin/AdminPaymentHistory.jsx

import React, { useState, useEffect } from 'react';
import { getAdminPaymentHistory } from '../../api/paymentApi';

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

const AdminPaymentHistory = () => {
    // All this logic is 100% unchanged
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getAdminPaymentHistory();
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
                <CardTitle>Full Payment Ledger</CardTitle>
                <CardDescription>
                    A record of all confirmed payments across all your buildings.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* 3. Replaced <table> with Shadcn <Table> */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Building</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Loading payment history...
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-destructive"
                                >
                                    Error: {error}
                                </TableCell>
                            </TableRow>
                        ) : payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No confirmed payments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map((payment) => (
                                <TableRow key={payment._id}>
                                    <TableCell>
                                        {new Date(payment.paymentDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{payment.tenantId?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        {payment.billId?.roomId?.buildingId?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {payment.billId?.roomId?.roomNumber || 'N/A'}
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



export default AdminPaymentHistory;