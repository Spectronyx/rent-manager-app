// File: frontend/src/components/admin/ManageRoom.jsx

import React, { useState } from 'react';
import { getAllTenants, updateTenant } from '../../api/tenantApi';
import { vacateRoom } from '../../api/roomApi';

// Receives the 'room' object and the 'onRefresh' function from the parent
const ManageRoom = ({ room, onRefresh }) => {
    const [isAssigning, setIsAssigning] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [error, setError] = useState('');

    // 1. Fetch the list of students when the "Assign" button is clicked
    const handleShowAssign = async () => {
        setIsAssigning(true);
        setError('');
        try {
            const tenantData = await getAllTenants();
            setStudents(tenantData);
            if (tenantData.length > 0) {
                setSelectedStudent(tenantData[0]._id); // Default to the first tenant
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // 2. Call the API to assign the tenant
    const handleConfirmAssign = async () => {
        if (!selectedStudent) {
            setError('Please select a student.');
            return;
        }
        setError('');
        try {
            await updateTenant(selectedStudent, {
                roomId: room._id,
                buildingId: room.buildingId,
            });
            setIsAssigning(false);
            onRefresh();
        } catch (err) {
            setError(err.message);
        }
    };

    // --- 2. ADD THIS NEW HANDLER ---
    const handleVacate = async () => {
        // Optional: Add a confirmation dialog
        if (window.confirm(`Are you sure you want to vacate ${room.tenantId.name}?`)) {
            try {
                // Clear tenant's room assignment
                await updateTenant(room.tenantId._id, { roomId: null, buildingId: null });
                await vacateRoom(room._id);
                onRefresh();
            } catch (err) {
                console.error(err);
            }
        }
    };

    // --- 3. UPDATE THE "OCCUPIED" JSX BLOCK ---
    if (room.status === 'Occupied') {
        return (
            <>
                <p>Tenant: {room.tenantId.name}</p>
                <button onClick={handleVacate} style={{ backgroundColor: '#f44336', color: 'white' }}>
                    Vacate Tenant
                </button>
            </>
        );
    }

    // If the room is already occupied, just show that
    if (room.status === 'Occupied') {
        return (
            <>
                <p>Tenant: {room.tenantId.name}</p>
                {/* We'll add a 'Vacate' button here later */}
                <button disabled>Vacate Tenant (Soon)</button>
            </>
        );
    }

    // If the room is vacant...
    if (!isAssigning) {
        // Show the "Assign" button
        return (
            <button onClick={handleShowAssign}>
                Assign Tenant
            </button>
        );
    }

    // If we are in "assigning" mode...
    return (
        <div>
            <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
            >
                {students.map((student) => (
                    <option key={student._id} value={student._id}>
                        {student.name}
                    </option>
                ))}
            </select>
            <button onClick={handleConfirmAssign}>Confirm</button>
            <button onClick={() => setIsAssigning(false)}>Cancel</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ManageRoom;