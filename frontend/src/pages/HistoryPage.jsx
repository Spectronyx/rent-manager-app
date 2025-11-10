// File: frontend/src/pages/HistoryPage.jsx

import React from 'react';
import useAuth from '../hooks/useAuth';
import MyPaymentHistory from '../components/student/MyPaymentHistory';
import AdminPaymentHistory from '../components/admin/AdminPaymentHistory';

const HistoryPage = () => {
    const { user } = useAuth();

    return (
        // 1. Use the same container and padding as the dashboard
        <div className="container mx-auto py-8">
            {/* 2. Styled header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Payment History</h1>
                <p className="text-lg text-muted-foreground">
                    View all confirmed payments.
                </p>
            </div>

            {/* 3. The logic is the same, just wrapped in a 'section' */}
            <section>
                {user.role === 'student' && <MyPaymentHistory />}
                {user.role === 'admin' && <AdminPaymentHistory />}
            </section>
        </div>
    );
};

export default HistoryPage;