import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Check,
    X,
    Calendar,
    DollarSign,
    User,
    AlertCircle,
    Plus
} from 'lucide-react';
import { useAnimationVariants } from '@/hooks/useAnimationVariants';
import { useToastActions } from '@/hooks/useToastActions';
import {
    getAllRentRecords,
    updatePaymentStatus,
    generateMonthlyRecords
} from '@/api/rentRecordApi';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const RentPaymentTracking = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showGenerateDialog, setShowGenerateDialog] = useState(false);
    const [generating, setGenerating] = useState(false);

    const { fadeIn, staggerContainer } = useAnimationVariants();
    const { showSuccess, showError } = useToastActions();

    useEffect(() => {
        loadRecords();
    }, [selectedMonth, selectedYear]);

    const loadRecords = async () => {
        setLoading(true);
        try {
            const data = await getAllRentRecords({
                month: selectedMonth,
                year: selectedYear
            });
            setRecords(data);
        } catch (error) {
            showError('Failed to load rent records', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentToggle = async (recordId, currentStatus) => {
        try {
            await updatePaymentStatus(recordId, !currentStatus);
            showSuccess(
                !currentStatus ? 'Marked as paid' : 'Marked as unpaid',
                'Rent payment status updated'
            );
            loadRecords();
        } catch (error) {
            showError('Failed to update payment status', error.message);
        }
    };

    const handleGenerateRecords = async () => {
        setGenerating(true);
        try {
            const result = await generateMonthlyRecords(selectedMonth, selectedYear);
            showSuccess(
                'Records generated',
                `Created ${result.recordsCreated} rent records for ${MONTHS[selectedMonth - 1]} ${selectedYear}`
            );
            setShowGenerateDialog(false);
            loadRecords();
        } catch (error) {
            showError('Failed to generate records', error.message);
        } finally {
            setGenerating(false);
        }
    };

    const paidCount = records.filter(r => r.isPaid).length;
    const unpaidCount = records.length - paidCount;
    const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
    const collectedAmount = records.filter(r => r.isPaid).reduce((sum, r) => sum + r.amount, 0);
    const duesAmount = totalAmount - collectedAmount;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <motion.div
                className="flex items-center justify-between"
                variants={fadeIn}
                initial="initial"
                animate="animate"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        Rent Payment Tracking
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Mark monthly rent payments for all tenants
                    </p>
                </div>
                <Button
                    className="bg-gradient-to-r from-cyan-500 to-purple-600"
                    onClick={() => setShowGenerateDialog(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Records
                </Button>
            </motion.div>

            {/* Month/Year Selector */}
            <GlassCard className="border-2 border-cyan-500/30 p-6">
                <div className="flex items-center gap-4">
                    <Calendar className="h-6 w-6 text-cyan-400" />
                    <div className="flex-1 flex items-center gap-4">
                        <div>
                            <label className="text-sm text-muted-foreground block mb-1">Month</label>
                            <select
                                className="glass rounded-lg px-4 py-2 border border-cyan-500/30 bg-transparent text-foreground"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            >
                                {MONTHS.map((month, idx) => (
                                    <option key={idx} value={idx + 1} className="bg-background">
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground block mb-1">Year</label>
                            <select
                                className="glass rounded-lg px-4 py-2 border border-cyan-500/30 bg-transparent text-foreground"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            >
                                {[2024, 2025, 2026].map(year => (
                                    <option key={year} value={year} className="bg-background">
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <GlassCard className="border-2 border-cyan-500/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/20">
                            <User className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Tenants</p>
                            <p className="text-2xl font-bold">{records.length}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="border-2 border-green-500/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/20">
                            <Check className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Paid</p>
                            <p className="text-2xl font-bold text-green-400">{paidCount}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="border-2 border-orange-500/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/20">
                            <AlertCircle className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Unpaid</p>
                            <p className="text-2xl font-bold text-orange-400">{unpaidCount}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="border-2 border-purple-500/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                            <DollarSign className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Dues</p>
                            <p className="text-2xl font-bold text-purple-400">₹{duesAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Records List */}
            <GlassCard className="border-2 border-cyan-500/30">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">
                        Payment Records for {MONTHS[selectedMonth - 1]} {selectedYear}
                    </h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading records...</p>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground text-lg">No rent records for this month</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Click "Generate Records" to create monthly records
                            </p>
                        </div>
                    ) : (
                        <motion.div
                            className="space-y-3"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {records.map((record) => (
                                <div
                                    key={record._id}
                                    className="glass rounded-lg p-4 border border-white/10 hover:border-cyan-400/30 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-foreground">
                                                        {record.tenantId?.name || 'Unknown Tenant'}
                                                    </span>
                                                    <Badge
                                                        className={
                                                            record.isPaid
                                                                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                                                : 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                                                        }
                                                    >
                                                        {record.isPaid ? 'Paid' : 'Unpaid'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{record.buildingId?.name}</span>
                                                    <span>Room {record.roomId?.roomNumber}</span>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        ₹{record.amount}
                                                    </span>
                                                    {record.paidDate && (
                                                        <span className="text-green-400">
                                                            Paid: {new Date(record.paidDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <Button
                                                variant={record.isPaid ? 'outline' : 'default'}
                                                size="sm"
                                                onClick={() => handlePaymentToggle(record._id, record.isPaid)}
                                                className={
                                                    record.isPaid
                                                        ? 'border-orange-500/50 hover:bg-orange-500/20'
                                                        : 'bg-gradient-to-r from-green-500 to-green-600'
                                                }
                                            >
                                                {record.isPaid ? (
                                                    <>
                                                        <X className="h-4 w-4 mr-2" />
                                                        Mark Unpaid
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Mark Paid
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </GlassCard>

            {/* Generate Records Dialog */}
            <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                <DialogContent className="glass-card border-cyan-500/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-cyan-400">
                            <Calendar className="h-5 w-5" />
                            Generate Monthly Records
                        </DialogTitle>
                        <DialogDescription>
                            This will create rent records for all active tenants for{' '}
                            <strong>{MONTHS[selectedMonth - 1]} {selectedYear}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowGenerateDialog(false)}
                            className="glass border-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleGenerateRecords}
                            disabled={generating}
                            className="bg-gradient-to-r from-cyan-500 to-purple-600"
                        >
                            {generating ? 'Generating...' : 'Generate Records'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RentPaymentTracking;
