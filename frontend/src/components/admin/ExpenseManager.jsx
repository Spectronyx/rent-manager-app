// File: frontend/src/components/admin/ExpenseManager.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
    createExpense,
    getExpensesForBuilding,
    getExpenseStats,
} from '../../api/expenseApi';

// 1. Import all our new Shadcn components
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// Helper to get today's date
const getTodayDate = () => new Date().toISOString().split('T')[0];

const ExpenseManager = ({ buildingId }) => {
    // All this state and logic is 100% unchanged
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({ totalExpenses: 0, count: 0 });
    const [showStats, setShowStats] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Maintenance');
    const [date, setDate] = useState(getTodayDate());

    const fetchExpenses = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getExpensesForBuilding(buildingId);
            setExpenses(data);
        } catch (err) {
            setError(err.message);
        }
        setIsLoading(false);
    }, [buildingId]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear old errors
        try {
            await createExpense({ buildingId, category, amount, description, date });
            setDescription('');
            setAmount('');
            setDate(getTodayDate());
            fetchExpenses();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleShowTotal = async () => {
        setError('');
        try {
            const statsData = await getExpenseStats(buildingId);
            setStats(statsData);
            setShowStats(true);
        } catch (err) {
            setError(err.message);
        }
    };

    // 2. This is the new, styled JSX, split into two cards
    return (
        <div className="space-y-6">
            {/* --- Card 1: Add New Expense Form --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Add New Expense</CardTitle>
                    <CardDescription>
                        Log a new expense for this building.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (₹)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                type="text"
                                placeholder="e.g., Plumbing repair"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            {/* 3. Replaced <select> with Shadcn <Select> */}
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                    <SelectItem value="Electricity">Electricity (Building)</SelectItem>
                                    <SelectItem value="Supplies">Supplies</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button type="submit">Add Expense</Button>
                    </form>
                </CardContent>
            </Card>

            {/* --- Card 2: Expense History & Stats --- */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Expense History</CardTitle>
                            {showStats && (
                                <div className="pt-2">
                                    <span className="font-bold text-lg">
                                        Total: ₹{stats.totalExpenses}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {' '}
                                        (from {stats.count} entries)
                                    </span>
                                </div>
                            )}
                        </div>
                        <Button variant="outline" size="sm" onClick={handleShowTotal}>
                            Calculate Total
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* 4. Replaced <ul> with <Table> */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Loading expenses...
                                    </TableCell>
                                </TableRow>
                            ) : expenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No expenses found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                expenses.map((exp) => (
                                    <TableRow key={exp._id}>
                                        <TableCell>
                                            {new Date(exp.date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>{exp.category}</TableCell>
                                        <TableCell>{exp.description}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            - ₹{exp.amount}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};



export default ExpenseManager;