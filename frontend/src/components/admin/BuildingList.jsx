// File: frontend/src/components/admin/BuildingList.jsx

import React from 'react';
import { Link } from 'react-router-dom';

// 1. Import the Shadcn Card components
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

const BuildingList = ({ buildings, isLoading, error }) => {


    if (isLoading) {
        return <p className="text-muted-foreground">Loading buildings...</p>;
    }

    if (error) {
        return <p className="text-destructive">Error: {error}</p>;
    }

    // 3. This is the new, styled JSX
    return (
        <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Your Buildings</h3>
            {buildings.length === 0 ? (
                <p className="text-muted-foreground">
                    You haven't added any buildings yet.
                </p>
            ) : (
                // 4. Use a responsive grid for the cards
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {buildings.map((building) => (
                        // 5. Wrap the Card in the Link to make it all clickable
                        <Link
                            key={building._id}
                            to={`/building/${building._id}`}
                            className="no-underline"
                        >
                            {/* 6. Replace the old <li> with a styled <Card> */}
                            <Card className="transition-all hover:shadow-md">
                                <CardHeader>
                                    <CardTitle>{building.name}</CardTitle>
                                    <CardDescription>{building.address}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

// 7. We can now delete the old 'buildingItemStyle' object
// const buildingItemStyle = { ... };

export default BuildingList;