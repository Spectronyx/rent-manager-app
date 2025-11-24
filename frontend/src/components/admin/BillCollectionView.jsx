import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    DollarSign,
    Clock,
    CheckCircle,
    AlertCircle,
    Building2,
    Home,
    User,
    Calendar
} from 'lucide-react';
import { getAllRentRecords, markBillAsPaid } from '@/api/rentRecordApi';
import { getMyBuildings } from '@/api/buildingApi';
import { useToastActions } from '@/hooks/useToastActions';
import { useAnimationVariants } from '@/hooks/useAnimationVariants';

export const BillCollectionView = ({ onRefresh }) => {
    const [bills, setBills] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        buildingId: '',
        isPaid: undefined,
        month: '',
        year: new Date().getFullYear()
    });
    const [selectedBill, setSelectedBill] = useState(null);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paymentData, setPaymentData] = useState({
        paymentMethod: 'cash',
        paidDate: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [collecting, setCollecting] = useState(false);

    const { showSuccess, showError } = useToastActions();
    const { staggerContainer, staggerItem } = useAnimationVariants();

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [billsData, buildingsData] = await Promise.all([
                getAllRentRecords(filters),
                getMyBuildings()
            ]);
            setBills(billsData);
            setBuildings(buildingsData);
        } catch (error) {
            showError('Failed to load bills', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCollectPayment = (bill) => {
        setSelectedBill(bill);
        setShowPaymentDialog(true);
    };

    const handleConfirmPayment = async () => {
        if (!selectedBill) return;

        setCollecting(true);
        try {
            await markBillAsPaid(
                selectedBill._id,
                paymentData.paymentMethod,
                paymentData.paidDate,
                paymentData.notes
            );

            showSuccess('Payment collected', `Payment recorded for ${selectedBill.tenantId.name}`);
            setShowPaymentDialog(false);
            setPaymentData({
                paymentMethod: 'cash',
                paidDate: new Date().toISOString().split('T')[0],
                notes: ''
            });
            loadData();
            onRefresh?.(); // Notify parent to refresh dashboard stats
        } catch (error) {
            showError('Failed to record payment', error.response?.data?.message || error.message);
        } finally {
            setCollecting(false);
        }
    };

    const getStatusBadge = (bill) => {
        const now = new Date();
        const dueDate = new Date(bill.dueDate);

        if (bill.isPaid) {
            return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Paid</Badge>;
        } else if (dueDate < now) {
            return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Overdue</Badge>;
        } else {
            return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">Pending</Badge>;
        }
    };

    const pendingBills = bills.filter(b => !b.isPaid);
    const totalPending = pendingBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const overdueCount = pendingBills.filter(b => new Date(b.dueDate) < new Date()).length;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                >
                    <DollarSign className="h-12 w-12 text-cyan-400" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card rounded-lg p-4 border-2 border-orange-500/30">
                    <p className="text-sm text-muted-foreground mb-1">Pending Bills</p>
                    <p className="text-2xl font-bold text-orange-400">{pendingBills.length}</p>
                </div>
                <div className="glass-card rounded-lg p-4 border-2 border-red-500/30">
                    <p className="text-sm text-muted-foreground mb-1">Overdue</p>
                    <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
                </div>
                <div className="glass-card rounded-lg p-4 border-2 border-green-500/30">
                    <p className="text-sm text-muted-foreground mb-1">Total Pending Amount</p>
                    <p className="text-2xl font-bold text-green-400">₹{totalPending.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card rounded-lg p-4 border border-cyan-500/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs">Building</Label>
                        <select
                            value={filters.buildingId}
                            onChange={(e) => setFilters({ ...filters, buildingId: e.target.value })}
                            className="w-full glass rounded-lg px-3 py-2 text-sm border border-cyan-500/30 bg-transparent text-foreground"
                        >
                            <option value="" className="bg-background">All Buildings</option>
                            {buildings.map(b => (
                                <option key={b._id} value={b._id} className="bg-background">{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">Status</Label>
                        <select
                            value={filters.isPaid === undefined ? '' : filters.isPaid}
                            onChange={(e) => setFilters({ ...filters, isPaid: e.target.value === '' ? undefined : e.target.value === 'true' })}
                            className="w-full glass rounded-lg px-3 py-2 text-sm border border-cyan-500/30 bg-transparent text-foreground"
                        >
                            <option value="" className="bg-background">All</option>
                            <option value="false" className="bg-background">Pending</option>
                            <option value="true" className="bg-background">Paid</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">Month</Label>
                        <select
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                            className="w-full glass rounded-lg px-3 py-2 text-sm border border-cyan-500/30 bg-transparent text-foreground"
                        >
                            <option value="" className="bg-background">All Months</option>
                            {monthNames.map((name, idx) => (
                                <option key={idx} value={idx + 1} className="bg-background">{name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">Year</Label>
                        <Input
                            type="number"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                            className="glass border-white/10 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Bills List */}
            <motion.div
                className="space-y-3"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                {bills.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No bills found for the selected filters</p>
                    </div>
                ) : (
                    bills.map((bill) => (
                        <motion.div
                            key={bill._id}
                            variants={staggerItem}
                            className="glass-card rounded-lg p-4 border border-white/10 hover:border-cyan-400/30 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Tenant Info */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {bill.tenantId?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{bill.tenantId?.name}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Building2 className="h-3 w-3" />
                                                {bill.buildingId?.name}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Room & Period */}
                                    <div>
                                        <p className="text-sm flex items-center gap-1 text-cyan-400">
                                            <Home className="h-3 w-3" />
                                            Room {bill.roomId?.roomNumber}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {monthNames[bill.month - 1]} {bill.year}
                                        </p>
                                    </div>

                                    {/* Amount Breakdown */}
                                    <div>
                                        <p className="text-xs text-muted-foreground">Rent: ₹{bill.amount}</p>
                                        <p className="text-xs text-muted-foreground">Electricity: ₹{bill.electricityBill} ({bill.electricityUnits} units)</p>
                                        <p className="text-sm font-semibold text-green-400 mt-1">
                                            Total: ₹{bill.totalAmount}
                                        </p>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex flex-col justify-between">
                                        <div className="space-y-1">
                                            {getStatusBadge(bill)}
                                            <p className="text-xs text-muted-foreground">
                                                Due: {new Date(bill.dueDate).toLocaleDateString()}
                                            </p>
                                            {bill.isPaid && bill.paidDate && (
                                                <p className="text-xs text-green-400">
                                                    Paid: {new Date(bill.paidDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                {!bill.isPaid && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleCollectPayment(bill)}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600"
                                    >
                                        <DollarSign className="h-4 w-4 mr-1" />
                                        Collect
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Payment Collection Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent className="glass-card border-green-500/30 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-400">
                            <DollarSign className="h-5 w-5" />
                            Collect Payment
                        </DialogTitle>
                        <DialogDescription>
                            Record payment for {selectedBill?.tenantId?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBill && (
                        <div className="space-y-4 py-4">
                            {/* Bill Summary */}
                            <div className="glass rounded-lg p-4 border border-cyan-500/20 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Rent:</span>
                                    <span>₹{selectedBill.amount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Electricity ({selectedBill.electricityUnits} units):</span>
                                    <span>₹{selectedBill.electricityBill}</span>
                                </div>
                                <div className="h-px bg-white/10" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span className="text-green-400">₹{selectedBill.totalAmount}</span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-2">
                                <Label>Payment Method *</Label>
                                <select
                                    value={paymentData.paymentMethod}
                                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                                    className="w-full glass rounded-lg px-4 py-2 border border-cyan-500/30 bg-transparent text-foreground"
                                >
                                    <option value="cash" className="bg-background">Cash</option>
                                    <option value="upi" className="bg-background">UPI</option>
                                    <option value="bank_transfer" className="bg-background">Bank Transfer</option>
                                    <option value="cheque" className="bg-background">Cheque</option>
                                </select>
                            </div>

                            {/* Payment Date */}
                            <div className="space-y-2">
                                <Label>Payment Date *</Label>
                                <Input
                                    type="date"
                                    value={paymentData.paidDate}
                                    onChange={(e) => setPaymentData({ ...paymentData, paidDate: e.target.value })}
                                    className="glass border-white/10"
                                />
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label>Notes (Optional)</Label>
                                <Textarea
                                    value={paymentData.notes}
                                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                                    placeholder="Add any additional notes..."
                                    className="glass border-white/10"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowPaymentDialog(false)}
                            className="glass border-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmPayment}
                            disabled={collecting}
                            className="bg-gradient-to-r from-green-500 to-emerald-600"
                        >
                            {collecting ? 'Recording...' : 'Confirm Payment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
