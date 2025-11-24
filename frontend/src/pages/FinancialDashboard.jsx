import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BillGenerationDialog } from '@/components/admin/BillGenerationDialog';
import { BillCollectionView } from '@/components/admin/BillCollectionView';
import { MonthlyReportsView } from '@/components/admin/MonthlyReportsView';
import { FinancialStatsRibbon } from '@/components/admin/FinancialStatsRibbon';
import { AddExpenseDialog } from '@/components/admin/AddExpenseDialog';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Home,
    AlertCircle,
    Calendar,
    Download,
    Users,
    Building2,
    FileText,
    BarChart3
} from 'lucide-react';
import { useAnimationVariants } from '@/hooks/useAnimationVariants';
import { getMonthlyStats, getBuildingFinancials, getRoomCollections } from '@/api/financialApi';
import { getMyBuildings } from '@/api/buildingApi';



import { exportToPDF } from '@/utils/pdfUtils';

const FinancialDashboard = () => {
    const [stats, setStats] = useState(null);
    const [buildings, setBuildings] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [buildingFinancials, setBuildingFinancials] = useState(null);
    const [roomCollections, setRoomCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBillGeneration, setShowBillGeneration] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);

    // Filter States
    const [filterPeriod, setFilterPeriod] = useState('monthly'); // 'monthly' or 'all'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const { fadeIn, staggerContainer } = useAnimationVariants();

    useEffect(() => {
        loadFinancialData();
    }, [filterPeriod, selectedMonth, selectedYear]);

    const loadFinancialData = async () => {
        setLoading(true);
        try {
            const [monthlyData, buildingsData, roomsData] = await Promise.all([
                getMonthlyStats(selectedMonth, selectedYear, filterPeriod),
                getMyBuildings(),
                getRoomCollections()
            ]);
            setStats(monthlyData);
            setBuildings(buildingsData);
            setRoomCollections(roomsData);
            if (buildingsData.length > 0 && !selectedBuilding) {
                loadBuildingFinancials(buildingsData[0]._id);
            }
        } catch (error) {
            console.error('Failed to load financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBuildingFinancials = async (buildingId) => {
        try {
            const data = await getBuildingFinancials(buildingId);
            setBuildingFinancials(data);
            setSelectedBuilding(buildingId);
        } catch (error) {
            console.error('Failed to load building financials:', error);
        }
    };

    const handleExportReport = () => {
        exportToPDF(stats, buildings, filterPeriod === 'monthly' ? selectedMonth : null, filterPeriod === 'monthly' ? selectedYear : null);
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block mb-4"
                    >
                        <DollarSign className="h-12 w-12 text-cyan-400" />
                    </motion.div>
                    <p className="text-muted-foreground">Loading financial data...</p>
                </div>
            </div>
        );
    }

    const totalDues = stats ? (stats.totalMonthlyRent - stats.totalCollections) : 0;
    const profitMargin = stats && stats.totalCollections > 0
        ? (((stats.totalCollections - stats.totalExpenses) / stats.totalCollections) * 100).toFixed(1)
        : 0;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <motion.div variants={fadeIn} initial="initial" animate="animate">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                            Financial Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {filterPeriod === 'all'
                                ? 'All-time financial overview'
                                : `Overview for ${monthNames[selectedMonth - 1]} ${selectedYear}`}
                        </p>
                    </div>

                    {/* Filters & Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={filterPeriod}
                            onChange={(e) => setFilterPeriod(e.target.value)}
                            className="glass rounded-lg px-3 py-2 border border-cyan-500/30 bg-transparent text-foreground text-sm"
                        >
                            <option value="monthly" className="bg-background">Monthly</option>
                            <option value="all" className="bg-background">All Time</option>
                        </select>

                        {filterPeriod === 'monthly' && (
                            <>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="glass rounded-lg px-3 py-2 border border-cyan-500/30 bg-transparent text-foreground text-sm"
                                >
                                    {monthNames.map((name, idx) => (
                                        <option key={idx} value={idx + 1} className="bg-background">{name}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="glass rounded-lg px-3 py-2 border border-cyan-500/30 bg-transparent text-foreground text-sm"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year} className="bg-background">{year}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        <div className="h-8 w-[1px] bg-white/10 mx-1 hidden md:block" />

                        <Button
                            onClick={() => setShowAddExpense(true)}
                            className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 h-9"
                        >
                            <TrendingDown className="h-4 w-4 mr-2" />
                            Add Expense
                        </Button>
                        <Button
                            onClick={handleExportReport}
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 h-9"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Overview Stats */}
            <FinancialStatsRibbon stats={stats} />

            {/* Detailed Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="border-2 border-cyan-500/30">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-cyan-500/20">
                                <Calendar className="h-5 w-5 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-semibold">Collection Rate</h3>
                        </div>
                        <div className="text-3xl font-bold text-cyan-400 mb-2">
                            {stats?.collectionRate || 0}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                            of expected rent collected
                        </p>
                    </div>
                </GlassCard>

                <GlassCard className="border-2 border-purple-500/30">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <Home className="h-5 w-5 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold">Occupancy Rate</h3>
                        </div>
                        <div className="text-3xl font-bold text-purple-400 mb-2">
                            {stats?.occupancyRate || 0}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {stats?.occupiedRooms || 0} of {stats?.totalRooms || 0} rooms filled
                        </p>
                    </div>
                </GlassCard>

                <GlassCard className="border-2 border-green-500/30">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <TrendingUp className="h-5 w-5 text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold">Profit Margin</h3>
                        </div>
                        <div className="text-3xl font-bold text-green-400 mb-2">
                            {profitMargin}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                            after all expenses
                        </p>
                    </div>
                </GlassCard>
            </div>

            {/* Tabs Section */}
            <GlassCard className="border-2 border-cyan-500/30">
                <Tabs defaultValue="building" className="w-full">
                    <TabsList className="glass border-b border-cyan-500/20 w-full justify-start rounded-none p-0">
                        <TabsTrigger value="building" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                            <Building2 className="h-4 w-4 mr-2" />
                            Per Building
                        </TabsTrigger>
                        <TabsTrigger value="room" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                            <Home className="h-4 w-4 mr-2" />
                            Per Room
                        </TabsTrigger>
                        <TabsTrigger value="bills" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                            <FileText className="h-4 w-4 mr-2" />
                            Bill Management
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Monthly Reports
                        </TabsTrigger>
                    </TabsList>

                    {/* Per Building Tab */}
                    <TabsContent value="building" className="p-6 space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <label className="text-sm font-medium">Select Building:</label>
                            <select
                                className="glass rounded-lg px-4 py-2 border border-cyan-500/30 bg-transparent text-foreground"
                                value={selectedBuilding || ''}
                                onChange={(e) => loadBuildingFinancials(e.target.value)}
                            >
                                {buildings.map(b => (
                                    <option key={b._id} value={b._id} className="bg-background">
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {buildingFinancials && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="glass rounded-lg p-4 border border-green-500/30">
                                        <p className="text-sm text-muted-foreground mb-1">Total Collections</p>
                                        <p className="text-2xl font-bold text-green-400">
                                            ₹{buildingFinancials.totalCollections?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="glass rounded-lg p-4 border border-red-500/30">
                                        <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                                        <p className="text-2xl font-bold text-red-400">
                                            ₹{buildingFinancials.totalExpenses?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="glass rounded-lg p-4 border border-cyan-500/30">
                                        <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                                        <p className={`text-2xl font-bold ${buildingFinancials.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ₹{buildingFinancials.netProfit?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Rooms in {buildingFinancials.building?.name}</h3>
                                    <div className="space-y-2">
                                        {buildingFinancials.rooms?.map(room => (
                                            <div key={room.id} className="glass rounded-lg p-4 border border-white/10 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-bold text-cyan-400">Room {room.roomNumber}</span>
                                                    <span className={`text-sm px-2 py-1 rounded ${room.isOccupied ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                        {room.isOccupied ? 'Occupied' : 'Vacant'}
                                                    </span>
                                                    {room.currentTenant && (
                                                        <span className="text-sm text-muted-foreground">{room.currentTenant}</span>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-semibold text-green-400">₹{room.monthlyRent}/month</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* Per Room Tab */}
                    <TabsContent value="room" className="p-6">
                        <div className="space-y-2">
                            {roomCollections.map((room, idx) => (
                                <div key={idx} className="glass rounded-lg p-4 border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="font-semibold text-cyan-400">{room.buildingName}</p>
                                            <p className="text-sm text-muted-foreground">Room {room.roomNumber}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${room.isOccupied ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                            {room.status}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Tenant: {room.tenant}</p>
                                        <p className="text-lg font-semibold text-green-400">₹{room.monthlyRent}/month</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Bill Management Tab */}
                    <TabsContent value="bills" className="p-6">
                        <div className="mb-6">
                            <Button
                                onClick={() => setShowBillGeneration(true)}
                                className="bg-gradient-to-r from-cyan-500 to-purple-600"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Bills
                            </Button>
                        </div>
                        <BillCollectionView onRefresh={loadFinancialData} />
                    </TabsContent>

                    {/* Monthly Reports Tab */}
                    <TabsContent value="reports" className="p-6">
                        <MonthlyReportsView />
                    </TabsContent>
                </Tabs>
            </GlassCard>

            {/* Bill Generation Dialog */}
            <BillGenerationDialog
                open={showBillGeneration}
                onClose={() => setShowBillGeneration(false)}
                onSuccess={() => {
                    setShowBillGeneration(false);
                    loadFinancialData();
                }}
            />

            {/* Add Expense Dialog */}
            <AddExpenseDialog
                open={showAddExpense}
                onClose={() => setShowAddExpense(false)}
                onSuccess={() => {
                    setShowAddExpense(false);
                    loadFinancialData();
                }}
            />
        </div>
    );
};

export default FinancialDashboard;
