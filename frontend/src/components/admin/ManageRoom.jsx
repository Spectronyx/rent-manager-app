// File: frontend/src/components/admin/ManageRoom.jsx

import React, { useState } from 'react';
import { getAllStudents } from '../../api/userApi';
import { assignTenantToRoom, vacateRoom } from '../../api/roomApi';

// 1. Import all our Shadcn components
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const ManageRoom = ({ room, onRefresh }) => {
    // All this state and logic is 100% unchanged
    const [isAssigning, setIsAssigning] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [error, setError] = useState('');

    const handleShowAssign = async () => {
        setIsAssigning(true);
        setError('');
        try {
            const studentData = await getAllStudents();
            setStudents(studentData);
            if (studentData.length > 0) {
                setSelectedStudent(studentData[0]._id);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleConfirmAssign = async () => {
        if (!selectedStudent) {
            setError('Please select a student.');
            return;
        }
        setError('');
        try {
            await assignTenantToRoom(room._id, selectedStudent);
            setIsAssigning(false);
            onRefresh();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleVacate = async () => {
        if (window.confirm(`Are you sure you want to vacate ${room.tenantId.name}?`)) {
            try {
                await vacateRoom(room._id);
                onRefresh();
            } catch (err) {
                console.error(err);
            }
        }
    };

    // --- 2. This is the new, styled JSX ---

    // State 1: Room is Occupied
    if (room.status === 'Occupied') {
        return (
            <div className="space-y-3">
                <p className="text-sm">
                    Tenant:{' '}
                    <span className="font-medium">{room.tenantId.name}</span>
                </p>
                {/* Use the 'destructive' variant for a red "vacate" button */}
                <Button
                    onClick={handleVacate}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                >
                    Vacate Tenant
                </Button>
            </div>
        );
    }

    // 3. I removed the duplicate 'if (room.status === 'Occupied')' block here

    // State 2: Room is Vacant, not currently assigning
    if (!isAssigning) {
        return (
            <Button onClick={handleShowAssign} size="sm" className="w-full">
                Assign Tenant
            </Button>
        );
    }

    // State 3: Room is Vacant, IS assigning
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="student-select">Select Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger id="student-select">
                        <SelectValue placeholder="Select a student..." />
                    </SelectTrigger>
                    <SelectContent>
                        {students.length === 0 ? (
                            <SelectItem value="none" disabled>No students found</SelectItem>
                        ) : (
                            students.map((student) => (
                                <SelectItem key={student._id} value={student._id}>
                                    {student.name}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex gap-2">
                <Button onClick={handleConfirmAssign} size="sm" className="flex-1">
                    Confirm
                </Button>
                <Button
                    onClick={() => setIsAssigning(false)}
                    variant="outline"
                    size="sm"
                >
                    Cancel
                </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
};

export default ManageRoom;