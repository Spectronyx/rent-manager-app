// File: frontend/src/components/admin/UpdateBillForm.jsx

import React, { useState } from 'react';
import { updateBillCharges } from '../../api/billApi';

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
        } catch (error) {
            setMessage('Failed to save.');
        }
    };

    return (
        <form onSubmit={handleSave} style={formStyle}>
            <span>
                <strong>{bill.roomId.roomNumber}</strong> ({bill.tenantId.name})
            </span>
            <span>Rent: ₹{bill.rent}</span>
            <label>
                Electricity: ₹
                <input
                    type="number"
                    value={electricity}
                    onChange={(e) => setElectricity(e.target.value)}
                    style={{ width: '80px' }}
                />
            </label>
            <label>
                Other: ₹
                <input
                    type="number"
                    value={other}
                    onChange={(e) => setOther(e.target.value)}
                    style={{ width: '80px' }}
                />
            </label>
            <button type="submit">Save</button>
            {message && <small style={{ marginLeft: '10px' }}>{message}</small>}
        </form>
    );
};

const formStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    border: '1px solid #eee',
    marginBottom: '10px',
    borderRadius: '5px',
};

export default UpdateBillForm;