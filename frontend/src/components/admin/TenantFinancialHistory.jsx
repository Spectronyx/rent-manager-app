import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    DollarSign,
    Calendar,
    Check,
    X,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { getTenantRentRecords } from '@/api/rentRecordApi';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const TenantFinancialHistory = ({ open, onClose, tenant }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && tenant) {
            loadFinancialHistory();
        }
    }, [open, tenant]);

    const loadFinancialHistory = async () => {
        setLoading(true);
        try {
            const data = await getTenantRentRecords(tenant._id);
            setRecords(data);
        } catch (error) {
            console.error('Failed to load financial history:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalPaid = records.filter(r => r.isPaid).reduce((sum, r) => sum + r.amount, 0);
    const totalDue = records.filter(r => !r.isPaid).reduce((sum, r) => sum + r.amount, 0);
    const paidCount = records.filter(r => r.isPaid).length;
    const dueCount = records.filter(r => !r.isPaid).length;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="glass-card border-purple-500/30 max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        Financial History
                    </DialogTitle>
                    <DialogDescription>
                        Payment records for {tenant?.name} ({tenant?.collegeId})
                    </DialogDescription>
                </DialogHeader>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="glass-card rounded-lg p-4 border-2 border-green-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-green-400" />
                            <p className="text-sm text-muted-foreground">Total Paid</p>
                        </div>
                        <p className="text-3xl font-bold text-green-400">₹{totalPaid.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">{paidCount} payments</p>
                    </div>

                    <div className="glass-card rounded-lg p-4 border-2 border-orange-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="h-5 w-5 text-orange-400" />
                            <p className="text-sm text-muted-foreground">Total Due</p>
                        </div>
                        <p className="text-3xl font-bold text-orange-400">₹{totalDue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">{dueCount} pending</p>
                    </div>
                </div>

                {/* Payment Records */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Payment History</h3>

                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Loading records...
                        </div>
                    ) : records.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">No payment records yet</p>
                        </div>
                    ) : (
                        records.map((record) => (
                            <div
                                key={record._id}
                                className="glass rounded-lg p-4 border border-white/10 hover:border-cyan-400/30 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-foreground">
                                                {MONTHS[record.month - 1]} {record.year}
                                            </h4>
                                            <Badge
                                                className={
                                                    record.isPaid
                                                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                                        : 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                                                }
                                            >
                                                {record.isPaid ? (
                                                    <>
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Paid
                                                    </>
                                                ) : (
                                                    <>
                                                        <X className="h-3 w-3 mr-1" />
                                                        Unpaid
                                                    </>
                                                )}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>Amount: ₹{record.amount}</span>
                                            {record.paidDate && (
                                                <span className="text-green-400">
                                                    Paid on: {new Date(record.paidDate).toLocaleDateString('en-IN')}
                                                </span>
                                            )}
                                            {!record.isPaid && record.dueDate && (
                                                <span className="text-orange-400">
                                                    Due: {new Date(record.dueDate).toLocaleDateString('en-IN')}
                                                </span>
                                            )}
                                        </div>

                                        {record.notes && (
                                            <p className="text-xs text-muted-foreground mt-2 italic">
                                                Note: {record.notes}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <p className={`text-2xl font-bold ${record.isPaid ? 'text-green-400' : 'text-orange-400'}`}>
                                            ₹{record.amount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
