import React from 'react';
import ManageRoom from './ManageRoom';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const RoomList = ({ rooms, onRefresh }) => {
    if (rooms.length === 0) {
        return (
            <p className="text-muted-foreground mt-4">
                No rooms found for this building yet.
            </p>
        );
    }

    return (
        <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
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

                            <ManageRoom room={room} onRefresh={onRefresh} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default RoomList;