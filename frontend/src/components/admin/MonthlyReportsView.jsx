import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { getBillsForMonth } from '@/api/rentRecordApi';
import { getExpensesForMonth } from '@/api/expenseApi';
import { getMyBuildings } from '@/api/buildingApi';
import { useToastActions } from '@/hooks/useToastActions';
import { useAnimationVariants } from '@/hooks/useAnimationVariants';

import { exportToPDF } from '@/utils/pdfUtils';

export const MonthlyReportsView = () => {
    const [reports, setReports] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [bills, setBills] = useState([]);
    const [expenses, setExpenses] = useState([]);

    const { showError } = useToastActions();
    const { fadeIn } = useAnimationVariants();

    useEffect(() => {
        loadBuildings();
    }, []);

    useEffect(() => {
        if (selectedMonth && selectedYear) {
            loadMonthlyReport();
        }
    }, [selectedMonth, selectedYear, selectedBuilding]);

    const loadBuildings = async () => {
        try {
            const data = await getMyBuildings();
            setBuildings(data);
        } catch (error) {
            showError('Failed to load buildings', error.message);
        }
    };

    const loadMonthlyReport = async () => {
        setLoading(true);
        try {
            const [billsData, expensesData] = await Promise.all([
                getBillsForMonth(selectedYear, selectedMonth, selectedBuilding),
                getExpensesForMonth(selectedYear, selectedMonth, selectedBuilding)
            ]);
            setBills(billsData);
            setExpenses(expensesData);
            calculateReportSummary(billsData, expensesData);
        } catch (error) {
            showError('Failed to load report', error.message);
            setBills([]);
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        // Prepare stats object similar to what FinancialDashboard uses
        const stats = {
            totalCollections: reports.totalCollected,
            totalExpenses: reports.totalExpenses,
            netProfit: reports.profit,
            collectionRate: reports.collectionRate,
            // Occupancy rate is not directly available here, but we can omit or calculate if needed
            // For now, we'll pass what we have
        };

        // Filter buildings if a specific one is selected
        const buildingsToExport = selectedBuilding
            ? buildings.filter(b => b._id === selectedBuilding)
            : buildings;

        exportToPDF(stats, buildingsToExport, selectedMonth, selectedYear);
    };

    const calculateReportSummary = (billData, expenseData) => {
        const totalBills = billData.length;
        const paidBills = billData.filter(b => b.isPaid).length;
        const pendingBills = totalBills - paidBills;

        const totalRent = billData.reduce((sum, b) => sum + b.amount, 0);
        const totalElectricity = billData.reduce((sum, b) => sum + b.electricityBill, 0);
        const totalAmount = billData.reduce((sum, b) => sum + b.totalAmount, 0);

        const totalCollected = billData.filter(b => b.isPaid).reduce((sum, b) => sum + b.totalAmount, 0);
        const totalPending = billData.filter(b => !b.isPaid).reduce((sum, b) => sum + b.totalAmount, 0);

        const collectionRate = totalBills > 0 ? ((paidBills / totalBills) * 100).toFixed(1) : 0;

        // Calculate expenses
        const totalExpenses = expenseData.reduce((sum, e) => sum + e.amount, 0);
        const expensesByCategory = {};
        expenseData.forEach(exp => {
            expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
        });

        // Calculate profit
        const profit = totalCollected - totalExpenses;
        const profitMargin = totalCollected > 0 ? ((profit / totalCollected) * 100).toFixed(1) : 0;

        setReports({
            totalBills,
            paidBills,
            pendingBills,
            totalRent,
            totalElectricity,
            totalAmount,
            totalCollected,
            totalPending,
            collectionRate,
            totalExpenses,
            expensesByCategory,
            profit,
            profitMargin
        });
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
        years.push(i);
    }

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <GlassCard className="border-2 border-cyan-500/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold">Select Period</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Month</Label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="w-full glass rounded-lg px-4 py-2 border border-cyan-500/30 bg-transparent text-foreground"
                        >
                            {monthNames.map((name, idx) => (
                                <option key={idx} value={idx + 1} className="bg-background">
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Year</Label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="w-full glass rounded-lg px-4 py-2 border border-cyan-500/30 bg-transparent text-foreground"
                        >
                            {years.map(year => (
                                <option key={year} value={year} className="bg-background">
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Building (Optional)</Label>
                        <select
                            value={selectedBuilding}
                            onChange={(e) => setSelectedBuilding(e.target.value)}
                            className="w-full glass rounded-lg px-4 py-2 border border-cyan-500/30 bg-transparent text-foreground"
                        >
                            <option value="" className="bg-background">All Buildings</option>
                            {buildings.map(b => (
                                <option key={b._id} value={b._id} className="bg-background">
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </GlassCard>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block"
                    >
                        <DollarSign className="h-12 w-12 text-cyan-400" />
                    </motion.div>
                </div>
            ) : bills.length === 0 ? (
                <GlassCard className="border border-white/10 p-12 text-center">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground text-lg">No bills found for {monthNames[selectedMonth - 1]} {selectedYear}</p>
                    <p className="text-sm text-muted-foreground mt-2">Generate bills for this month to see the report</p>
                </GlassCard>
            ) : (
                <>
                    {/* Report Header */}
                    <motion.div variants={fadeIn} initial="initial" animate="animate">
                        <GlassCard className="border-2 border-purple-500/30 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                                        {monthNames[selectedMonth - 1]} {selectedYear} Report
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {selectedBuilding ? buildings.find(b => b._id === selectedBuilding)?.name : 'All Buildings'}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleExportPDF}
                                    className="bg-gradient-to-r from-cyan-500 to-purple-600"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export PDF
                                </Button>
                            </div>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="glass rounded-lg p-4 border border-cyan-500/20">
                                    <p className="text-xs text-muted-foreground mb-1">Total Bills</p>
                                    <p className="text-2xl font-bold text-cyan-400">{reports.totalBills}</p>
                                </div>
                                <div className="glass rounded-lg p-4 border border-green-500/20">
                                    <p className="text-xs text-muted-foreground mb-1">Paid</p>
                                    <p className="text-2xl font-bold text-green-400">{reports.paidBills}</p>
                                </div>
                                <div className="glass rounded-lg p-4 border border-orange-500/20">
                                    <p className="text-xs text-muted-foreground mb-1">Pending</p>
                                    <p className="text-2xl font-bold text-orange-400">{reports.pendingBills}</p>
                                </div>
                                <div className="glass rounded-lg p-4 border border-purple-500/20">
                                    <p className="text-xs text-muted-foreground mb-1">Collection Rate</p>
                                    <p className="text-2xl font-bold text-purple-400">{reports.collectionRate}%</p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GlassCard className="border-2 border-green-500/30 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-green-500/20">
                                    <TrendingUp className="h-5 w-5 text-green-400" />
                                </div>
                                <h3 className="text-lg font-semibold">Revenue Collected</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Collected:</span>
                                    <span className="text-xl font-bold text-green-400">
                                        ₹{reports.totalCollected?.toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    From {reports.paidBills} paid bills
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="border-2 border-orange-500/30 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-orange-500/20">
                                    <TrendingDown className="h-5 w-5 text-orange-400" />
                                </div>
                                <h3 className="text-lg font-semibold">Pending Amount</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Pending:</span>
                                    <span className="text-xl font-bold text-orange-400">
                                        ₹{reports.totalPending?.toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    From {reports.pendingBills} pending bills
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Breakdown */}
                    <GlassCard className="border border-white/10 p-6">
                        <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="glass rounded-lg p-4 border border-cyan-500/20">
                                <p className="text-sm text-muted-foreground mb-2">Rent Revenue</p>
                                <p className="text-2xl font-bold text-cyan-400">₹{reports.totalRent?.toLocaleString()}</p>
                            </div>
                            <div className="glass rounded-lg p-4 border border-yellow-500/20">
                                <p className="text-sm text-muted-foreground mb-2">Electricity Revenue</p>
                                <p className="text-2xl font-bold text-yellow-400">₹{reports.totalElectricity?.toLocaleString()}</p>
                            </div>
                            <div className="glass rounded-lg p-4 border border-purple-500/20">
                                <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
                                <p className="text-2xl font-bold text-purple-400">₹{reports.totalAmount?.toLocaleString()}</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Expenses & Profit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GlassCard className="border-2 border-red-500/30 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-red-500/20">
                                    <TrendingDown className="h-5 w-5 text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold">Total Expenses</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Spent:</span>
                                    <span className="text-xl font-bold text-red-400">
                                        ₹{reports.totalExpenses?.toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    From {expenses.length} expense(s)
                                </div>
                                {Object.keys(reports.expensesByCategory || {}).length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <p className="text-xs text-muted-foreground">By Category:</p>
                                        {Object.entries(reports.expensesByCategory).map(([category, amount]) => (
                                            <div key={category} className="flex justify-between text-sm">
                                                <span className="capitalize">{category}:</span>
                                                <span className="text-red-400">₹{amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        <GlassCard className={`border-2 p-6 ${reports.profit >= 0 ? 'border-green-500/30' : 'border-red-500/30'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg ${reports.profit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                    <DollarSign className={`h-5 w-5 ${reports.profit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                                </div>
                                <h3 className="text-lg font-semibold">Net Profit</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Profit/Loss:</span>
                                    <span className={`text-xl font-bold ${reports.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ₹{reports.profit?.toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Revenue - Expenses
                                </div>
                                <div className="glass rounded-lg p-3 border border-white/10 mt-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">Profit Margin:</span>
                                        <span className={`font-semibold ${reports.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {reports.profitMargin}%
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Collected: ₹{reports.totalCollected?.toLocaleString()} | Expenses: ₹{reports.totalExpenses?.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Bills Detail Table */}
                    <GlassCard className="border border-white/10 p-6">
                        <h3 className="text-lg font-semibold mb-4">Bill Details ({bills.length} bills)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Tenant</th>
                                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Room</th>
                                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">Rent</th>
                                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">Electricity</th>
                                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">Total</th>
                                        <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.map(bill => (
                                        <tr key={bill._id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-3">
                                                <p className="font-medium">{bill.tenantId?.name}</p>
                                                <p className="text-xs text-muted-foreground">{bill.buildingId?.name}</p>
                                            </td>
                                            <td className="p-3 text-cyan-400">
                                                Room {bill.roomId?.roomNumber}
                                            </td>
                                            <td className="p-3 text-right">₹{bill.amount}</td>
                                            <td className="p-3 text-right">
                                                ₹{bill.electricityBill}
                                                <span className="text-xs text-muted-foreground ml-1">
                                                    ({bill.electricityUnits}u)
                                                </span>
                                            </td>
                                            <td className="p-3 text-right font-semibold text-green-400">
                                                ₹{bill.totalAmount}
                                            </td>
                                            <td className="p-3 text-center">
                                                {bill.isPaid ? (
                                                    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                                                        Paid
                                                    </span>
                                                ) : (
                                                    <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </>
            )}
        </div>
    );
};
