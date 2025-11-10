// File: frontend/src/components/admin/RoomList.jsx

import React from 'react';
// We don't need Link here anymore as the child components handle actions
import ManageRoom from './ManageRoom';
import UploadDocumentForm from './UploadDocumentForm';
import DocumentList from '../DocumentList';

// 1. Import our Shadcn Card components
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator'; // For nice dividers

const RoomList = ({ rooms, onRefresh }) => {
    if (rooms.length === 0) {
        return (
            <p className="text-muted-foreground mt-4">
                No rooms found for this building yet.
            </p>
        );
    }

    // 2. This is the new, styled JSX
    return (
        <div className="mt-6">
            {/* 3. Use a responsive grid for the room cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                    // 4. Replace the old <div> with a <Card>
                    <Card key={room._id}>
                        <CardHeader>
                            <CardTitle>Room: {room.roomNumber}</CardTitle>
                            <CardDescription>
                                Status: <span className="font-semibold">{room.status}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Base Rent:{' '}
                                <span className="font-bold">₹{room.monthlyRent}</span>
                            </p>

                            <Separator />

                            {/* 5. The "Manage" component for move-in/move-out */}
                            <ManageRoom room={room} onRefresh={onRefresh} />

                            {/* 6. Document section only appears if a tenant is assigned */}
                            {room.status === 'Occupied' && room.tenantId?._id && (
                                <div className="space-y-4">
                                    <Separator />
                                    <UploadDocumentForm userId={room.tenantId._id} />
                                    <DocumentList userId={room.tenantId._id} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// 7. We can now delete the old 'roomCardStyle' object
// const roomCardStyle = { ... };

export default RoomList;