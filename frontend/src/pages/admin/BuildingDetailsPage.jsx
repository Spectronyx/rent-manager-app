// File: frontend/src/pages/admin/BuildingDetailsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBuildingById } from '../../api/buildingApi';
import { getRoomsInBuilding } from '../../api/roomApi';
import CreateRoomForm from '../../components/admin/CreateRoomForm';
import RoomList from '../../components/admin/RoomList';
import BillManager from '../../components/admin/BillManager';
import ExpenseManager from '../../components/admin/ExpenseManager';

// 1. Import our Shadcn components
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button'; // We'll use this for the back link

const BuildingDetailsPage = () => {
    // All this state and logic is 100% unchanged
    const { id: buildingId } = useParams();
    const [building, setBuilding] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRooms = useCallback(async () => {
        try {
            const roomsData = await getRoomsInBuilding(buildingId);
            setRooms(roomsData);
        } catch (err) {
            setError(err.message);
        }
    }, [buildingId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const buildingData = await getBuildingById(buildingId);
                setBuilding(buildingData);
                await fetchRooms();
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [buildingId, fetchRooms]);

    // 6. This refresh function is unchanged
    const handleRoomCreated = () => {
        fetchRooms();
    };

    // 2. Styled loading/error states
    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <p className="text-muted-foreground">Loading building details...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="container mx-auto py-8">
                <p className="text-destructive">Error: {error}</p>
            </div>
        );
    }
    if (!building) {
        return (
            <div className="container mx-auto py-8">
                <p>Building not found.</p>
            </div>
        );
    }

    // 3. This is the new, styled JSX
    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Back Link */}
            <Button variant="outline" asChild>
                <Link to="/dashboard">&larr; Back to Dashboard</Link>
            </Button>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">{building.name}</h1>
                <p className="text-lg text-muted-foreground">{building.address}</p>
            </div>

            <Separator />

            {/* Expense Manager Section */}
            <section>
                <ExpenseManager buildingId={buildingId} />
            </section>

            <Separator />

            {/* Bill Manager Section */}
            <section>
                <BillManager buildingId={buildingId} />
            </section>

            <Separator />

            {/* Room Management Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold">Manage Rooms</h2>
                <CreateRoomForm
                    buildingId={buildingId}
                    onRoomCreated={handleRoomCreated}
                />
                <RoomList rooms={rooms} onRefresh={handleRoomCreated} />
            </section>
        </div>
    );
};

export default BuildingDetailsPage;