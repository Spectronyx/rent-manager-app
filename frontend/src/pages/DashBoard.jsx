// File: frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect, useCallback } from 'react'; /import useAuth from '../hooks/useAuth';
import CreateBuildingForm from '../components/admin/CreateBuildingForm';
import BuildingList from '../components/admin/BuildingList';
import StudentBillView from '../components/student/StudentBillView';
import PendingBillsList from '../components/admin/PendingBillsList';
import DocumentList from '../components/DocumentList';
import CreateAdminForm from '../components/admin/CreateAdminForm';
import { getMyBuildings } from '../api/buildingApi'; // 2. Import the API call

// 1. Import our new Shadcn Separator
import { Separator } from '@/components/ui/separator';

const DashboardPage = () => {
    const { user } = useAuth();

    // 3. Lift the state up to the parent
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 4. Create the fetch/refresh function
    const fetchBuildings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMyBuildings();
            setBuildings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // 5. Fetch buildings when the admin dashboard loads
    useEffect(() => {
        if (user.role === 'admin') {
            fetchBuildings();
        }
    }, [user.role, fetchBuildings]);

    if (!user) {
        return <p>Loading...</p>;
    }

    // 6. This is the "refresh" function we'll pass to the form
    const handleBuildingCreated = () => {
        fetchBuildings(); // Just re-run the fetch
    };

    if (!user) {
        return <p>Loading...</p>;
    }


    // 2. This is the new, styled JSX
    return (
        // Use a 'container' for centered, max-width content
        // and 'py-8' for vertical padding
        <div className="container mx-auto py-8">
            {/* Header section with Tailwind typography */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
                <p className="text-lg text-muted-foreground">Your role: {user.role}</p>
            </div>

            {/* Use the Shadcn Separator */}
            <Separator className="my-6" />

            {/* 5. Render different components based on role */}
            {user.role === 'admin' && (
                // Use 'space-y-8' to add vertical space between admin components
                <section className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
                        {/* The "to-do" list is most important, so it's first */}
                        <PendingBillsList />
                    </div>

                    <Separator />

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Manage Buildings</h2>
                        {/* 7. Pass the "refresh" function to the form */}
                        <CreateBuildingForm onBuildingCreated={handleBuildingCreated} />

                        {/* 8. Pass the buildings list (and state) to the list component */}
                        <BuildingList
                            buildings={buildings}
                            isLoading={loading}
                            error={error}
                        />
                    </div>
                    <Separator />
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">App Management</h2>
                        <CreateAdminForm />
                    </div>
                </section>
            )}

            {user.role === 'student' && (
                <section className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Student Dashboard</h2>
                        {/* We removed the redundant <p> tag */}
                        <StudentBillView />
                    </div>

                    <Separator />

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Your Documents</h2>
                        <DocumentList />
                    </div>
                </section>
            )}
        </div>
    );
};

export default DashboardPage;