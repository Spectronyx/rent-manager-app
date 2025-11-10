// File: frontend/src/components/admin/BillManager.jsx

import React, { useState } from 'react';
// 1. Import our new API function and component
import { generateBills, getPendingBillsForBuilding } from '../../api/billApi';
import UpdateBillForm from './UpdateBillForm';
import { useEffect } from 'react';
import { useCallback } from 'react';

// We get the buildingId from the parent page
const BillManager = ({ buildingId }) => {
    // Get current month and year as default
    const [month, setMonth] = useState(new Date().getMonth() + 1); // +1 because getMonth() is 0-indexed
    const [year, setYear] = useState(new Date().getFullYear());
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // 2. Add state for our list of pending bills
    const [pendingBills, setPendingBills] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 3. Create a function to fetch the bills
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

    // 4. Fetch the bills when the component first loads
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
            // 5. AFTER generating, refresh the list!
            fetchPendingBills();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={managerStyle}>
            <h4>Generate Monthly Bills</h4>
            <p>
                This will create a new, pending bill for every "Occupied" room in this
                building for the selected month.
            </p>
            <form onSubmit={handleGenerate}>
                <div style={{ marginRight: '10px' }}>
                    <label htmlFor="month">Month:</label>
                    <input
                        type="number"
                        id="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        min="1"
                        max="12"
                    />
                </div>
                <div style={{ marginRight: '10px' }}>
                    <label htmlFor="year">Year:</label>
                    <input
                        type="number"
                        id="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        min="2020"
                    />
                </div>
                <button type="submit">Generate Bills</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <hr style={{ margin: '2rem 0' }} />

            {/* 6. Add our new list section */}
            <h4>Pending Bills for This Building</h4>
            <p>Add electricity/other charges below. The student will see the new total.</p>
            {isLoading && <p>Loading pending bills...</p>}
            <div>
                {pendingBills.length > 0 ? (
                    pendingBills.map((bill) => (
                        <UpdateBillForm key={bill._id} bill={bill} />
                    ))
                ) : (
                    <p>No pending bills found for this building.</p>
                )}
            </div>
        </div>
    );
};

const managerStyle = {
    padding: '1.5rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    background: '#f9f9f9',
    marginBottom: '2rem',
};

export default BillManager;