import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import { StatsRibbon } from '../components/admin/StatsRibbon';
import BuildingList from '../components/admin/BuildingList';
import { CreateBuildingDialog } from '../components/admin/CreateBuildingDialog';
import { CreateTenantDialog } from '../components/admin/CreateTenantDialog';
import { GradientBackground } from '../components/backgrounds/GradientBackground';
import { ParticleBackground } from '../components/backgrounds/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Users, FileText } from 'lucide-react';
import { getMyBuildings } from '../api/buildingApi';
import { getMonthlyStats } from '../api/financialApi';
import { useAnimationVariants } from '../hooks/useAnimationVariants';
import { useToastActions } from '../hooks/useToastActions';

const DashboardPage = () => {
    const { user } = useAuth();
    const [buildings, setBuildings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateBuilding, setShowCreateBuilding] = useState(false);
    const [showCreateTenant, setShowCreateTenant] = useState(false);
    const { fadeIn } = useAnimationVariants();
    const { showError } = useToastActions();

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [buildingsData, statsData] = await Promise.all([
                getMyBuildings(),
                getMonthlyStats()
            ]);
            setBuildings(buildingsData);
            setStats(statsData);
            setError('');
        } catch (err) {
            const errorMsg = err.message || 'Failed to load dashboard data';
            setError(errorMsg);
            showError('Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block mb-4"
                    >
                        <Building2 className="h-12 w-12 text-cyan-400" />
                    </motion.div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            {/* Animated Backgrounds */}
            <GradientBackground />
            <ParticleBackground particleCount={20} />

            {/* Main Content */}
            <div className="relative z-10">
                {/* Welcome Header */}
                <motion.div
                    className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8"
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Welcome back, {user.name}
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Admin Dashboard - Manage your properties
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                                onClick={() => setShowCreateBuilding(true)}
                            >
                                <Building2 className="h-4 w-4 mr-2" />
                                New Building
                            </Button>
                            <Button
                                variant="outline"
                                className="glass border-cyan-500/30 hover:bg-cyan-500/20"
                                onClick={() => setShowCreateTenant(true)}
                            >
                                <Users className="h-4 w-4 mr-2" />
                                New Tenant
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Ribbon */}
                <StatsRibbon stats={stats} />

                {/* Buildings Section */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div
                        variants={fadeIn}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Your Buildings</h2>
                            {buildings.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={fetchDashboardData}
                                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                                >
                                    Refresh
                                </Button>
                            )}
                        </div>

                        <BuildingList
                            buildings={buildings}
                            isLoading={loading}
                            error={error}
                            onRefresh={fetchDashboardData}
                        />
                    </motion.div>
                </div>

                {/* Cyber Grid Overlay */}
                <div className="fixed inset-0 cyber-grid opacity-5 pointer-events-none z-0" />
            </div>

            {/* Create Building Dialog */}
            <CreateBuildingDialog
                open={showCreateBuilding}
                onClose={() => setShowCreateBuilding(false)}
                onSuccess={() => {
                    setShowCreateBuilding(false);
                    fetchDashboardData();
                }}
            />

            {/* Create Tenant Dialog */}
            <CreateTenantDialog
                open={showCreateTenant}
                onClose={() => setShowCreateTenant(false)}
                onSuccess={() => {
                    setShowCreateTenant(false);
                    fetchDashboardData();
                }}
            />
        </div>
    );
};

export default DashboardPage;