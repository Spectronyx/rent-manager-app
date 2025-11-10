// File: frontend/src/components/admin/PendingBillsList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getPendingBills } from '../../api/billApi';
import { confirmPayment } from '../../api/paymentApi';

const PendingBillsList = () => {
    const [bills, setBills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // 1. Function to fetch the list
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

    // 2. Fetch the list on component load
    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    // 3. The "Confirm" button handler
    const handleConfirm = async (billId, amount) => {
        if (window.confirm('Have you received this payment in your bank account?')) {
            try {
                await confirmPayment(billId, amount, 'UPI');
                // Refresh the list after confirming
                fetchPending();
            } catch (err) {
                setError(err.message); // Show an error on this specific item
            }
        }
    };

    if (isLoading) return <p>Loading pending payments...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div>
            <h3>Payments Awaiting Confirmation</h3>
            {bills.length === 0 ? (
                <p>No payments are currently awaiting your confirmation.</p>
            ) : (
                bills.map((bill) => (
                    <div key={bill._id} style={billItemStyle}>
                        <p>
                            <strong>{bill.tenantId.name}</strong> (Room: {bill.roomId.roomNumber})
                        </p>
                        <p>Amount: <strong>₹{bill.totalAmount}</strong></p>
                        <button
                            onClick={() => handleConfirm(bill._id, bill.totalAmount)}
                            style={{ background: 'green', color: 'white' }}
                        >
                            Confirm Payment
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

const billItemStyle = {
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginBottom: '10px',
    background: '#fffbe6',
};

export default PendingBillsList;