import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToastActions } from '@/hooks/useToastActions';
import { createExpense } from '@/api/expenseApi';
import { getMyBuildings } from '@/api/buildingApi';
import { Loader2, DollarSign, Calendar, Building2, Tag } from 'lucide-react';

export const AddExpenseDialog = ({ open, onClose, onSuccess, preSelectedBuildingId }) => {
    const [loading, setLoading] = useState(false);
    const [buildings, setBuildings] = useState([]);
    const { showSuccess, showError } = useToastActions();

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            buildingId: preSelectedBuildingId || '',
            amount: '',
            category: 'maintenance',
            description: '',
            expenseDate: new Date().toISOString().split('T')[0],
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            notes: ''
        }
    });

    const selectedDate = watch('expenseDate');

    useEffect(() => {
        if (open) {
            loadBuildings();
            // Update month/year when date changes
            if (selectedDate) {
                const date = new Date(selectedDate);
                setValue('month', date.getMonth() + 1);
                setValue('year', date.getFullYear());
            }
        }
    }, [open, selectedDate, setValue]);

    const loadBuildings = async () => {
        try {
            const data = await getMyBuildings();
            setBuildings(data);
            if (preSelectedBuildingId) {
                setValue('buildingId', preSelectedBuildingId);
            } else if (data.length > 0 && !watch('buildingId')) {
                setValue('buildingId', data[0]._id);
            }
        } catch (error) {
            console.error('Failed to load buildings', error);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await createExpense(data);
            showSuccess('Expense Added', 'The expense has been recorded successfully.');
            reset();
            onSuccess?.();
            onClose();
        } catch (error) {
            showError('Failed to add expense', error.message);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'electricity', label: 'Electricity' },
        { value: 'water', label: 'Water' },
        { value: 'salaries', label: 'Salaries' },
        { value: 'repairs', label: 'Repairs' },
        { value: 'cleaning', label: 'Cleaning' },
        { value: 'security', label: 'Security' },
        { value: 'taxes', label: 'Taxes' },
        { value: 'other', label: 'Other' }
    ];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="glass-card border-red-500/30 max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-400">
                        <DollarSign className="h-5 w-5" />
                        Add Building Expense
                    </DialogTitle>
                    <DialogDescription>
                        Record a new expenditure for a building.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    {/* Building Selection */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            Building
                        </Label>
                        <select
                            {...register('buildingId', { required: 'Building is required' })}
                            className="w-full glass rounded-lg px-3 py-2 border border-white/10 bg-transparent text-foreground focus:border-red-500/50 outline-none"
                            disabled={!!preSelectedBuildingId}
                        >
                            <option value="" className="bg-background">Select Building</option>
                            {buildings.map(b => (
                                <option key={b._id} value={b._id} className="bg-background">
                                    {b.name}
                                </option>
                            ))}
                        </select>
                        {errors.buildingId && <p className="text-xs text-red-400">{errors.buildingId.message}</p>}
                    </div>

                    {/* Amount & Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                Amount
                            </Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                {...register('amount', { required: 'Amount is required', min: 0 })}
                                className="glass border-white/10 focus:border-red-500/50"
                            />
                            {errors.amount && <p className="text-xs text-red-400">{errors.amount.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                Category
                            </Label>
                            <select
                                {...register('category', { required: 'Category is required' })}
                                className="w-full glass rounded-lg px-3 py-2 border border-white/10 bg-transparent text-foreground focus:border-red-500/50 outline-none"
                            >
                                {categories.map(c => (
                                    <option key={c.value} value={c.value} className="bg-background">
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Date
                        </Label>
                        <Input
                            type="date"
                            {...register('expenseDate', { required: 'Date is required' })}
                            className="glass border-white/10 focus:border-red-500/50"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            placeholder="e.g., Monthly elevator maintenance"
                            {...register('description', { required: 'Description is required' })}
                            className="glass border-white/10 focus:border-red-500/50"
                        />
                        {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label>Notes (Optional)</Label>
                        <Textarea
                            placeholder="Additional details..."
                            {...register('notes')}
                            className="glass border-white/10 focus:border-red-500/50"
                            rows={2}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="glass border-white/10 hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                'Add Expense'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
