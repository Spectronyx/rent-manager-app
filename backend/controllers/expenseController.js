// File: backend/controllers/expenseController.js

const asyncHandler = require('express-async-handler');
const Expense = require('../models/expenseModel.js');
const Building = require('../models/buildingModel.js'); // For security check
const mongoose = require('mongoose'); // <-- 1. Import mongoose

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private/Admin
const createExpense = asyncHandler(async (req, res) => {
    const {
        buildingId,
        category,
        amount,
        description,
        month,
        year,
        expenseDate,
        notes
    } = req.body;
    const adminId = req.user._id;

    if (!buildingId || !category || !amount || !description || !month || !year) {
        res.status(400);
        throw new Error('Please fill out all required fields');
    }

    // Security check: Does this admin own the building?
    const building = await Building.findById(buildingId);
    if (!building || building.adminId.toString() !== adminId.toString()) {
        res.status(401);
        throw new Error('Not authorized to add expenses to this building');
    }

    const expense = await Expense.create({
        buildingId,
        adminId,
        category,
        amount: Number(amount),
        description,
        month: parseInt(month),
        year: parseInt(year),
        expenseDate: expenseDate || Date.now(),
        notes: notes || '',
    });

    res.status(201).json(expense);
});

// @desc    Get all expenses for a building
// @route   GET /api/expenses/building/:buildingId
// @access  Private/Admin
const getExpensesForBuilding = asyncHandler(async (req, res) => {
    const {
        buildingId
    } = req.params;
    const adminId = req.user._id;

    // Security check
    const building = await Building.findById(buildingId);
    if (!building || building.adminId.toString() !== adminId.toString()) {
        res.status(401);
        throw new Error('Not authorized to view these expenses');
    }

    const expenses = await Expense.find({
        buildingId
    }).sort({
        year: -1,
        month: -1,
        expenseDate: -1
    });
    res.json(expenses);
});

// @desc    Get expenses for a specific month
// @route   GET /api/expenses/month/:year/:month
// @access  Private/Admin
const getExpensesForMonth = asyncHandler(async (req, res) => {
    const { year, month } = req.params;
    const { buildingId } = req.query;
    const adminId = req.user._id;

    const filter = {
        adminId,
        year: parseInt(year),
        month: parseInt(month)
    };

    if (buildingId) {
        // Security check if building ID provided
        const building = await Building.findById(buildingId);
        if (!building || building.adminId.toString() !== adminId.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }
        filter.buildingId = buildingId;
    }

    const expenses = await Expense.find(filter)
        .populate('buildingId', 'name')
        .sort({ expenseDate: -1 });

    res.json(expenses);
});

// @desc    Get expense statistics for a building
// @route   GET /api/expenses/stats/:buildingId
// @access  Private/Admin
const getExpenseStats = asyncHandler(async (req, res) => {
    const {
        buildingId
    } = req.params;
    const adminId = req.user._id;

    // Security check
    const building = await Building.findById(buildingId);
    if (!building || building.adminId.toString() !== adminId.toString()) {
        res.status(401);
        throw new Error('Not authorized for this building');
    }

    // 2. Use an Aggregation Pipeline to calculate the sum
    const stats = await Expense.aggregate([{
        // Stage 1: Filter to get only expenses for this building
        // We must convert the string ID to a MongoDB ObjectId
        $match: {
            buildingId: new mongoose.Types.ObjectId(buildingId)
        },
    },
    {
        // Stage 2: Group them together and calculate the sum
        $group: {
            _id: '$buildingId', // Group by buildingId
            totalExpenses: {
                $sum: '$amount'
            }, // Sum the 'amount' field
            count: {
                $sum: 1
            }, // Count the number of expense entries
        },
    },
    ]);

    if (stats.length > 0) {
        res.json(stats[0]); // Send back the first (and only) result
    } else {
        // No expenses found, send back zeros
        res.json({
            _id: buildingId,
            totalExpenses: 0,
            count: 0
        });
    }
});

// @desc    Get monthly profit analysis
// @route   GET /api/expenses/profit-analysis
// @access  Private/Admin
const getMonthlyProfitAnalysis = asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    const { months = 6, buildingId } = req.query;

    // Get buildings owned by admin
    const buildingFilter = { adminId };
    if (buildingId) buildingFilter._id = buildingId;

    const buildings = await Building.find(buildingFilter);
    const buildingIds = buildings.map(b => b._id);

    // Get expense data for last N months
    const currentDate = new Date();
    const monthsData = [];

    for (let i = parseInt(months) - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        // Get expenses for this month
        const expenses = await Expense.aggregate([
            {
                $match: {
                    buildingId: { $in: buildingIds },
                    month,
                    year
                }
            },
            {
                $group: {
                    _id: null,
                    totalExpenses: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        monthsData.push({
            month,
            year,
            monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
            expenses: expenses[0] || { totalExpenses: 0, count: 0 }
        });
    }

    res.json(monthsData);
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
const deleteExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');
    }

    // Security check
    if (expense.adminId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted', id: req.params.id });
});

module.exports = {
    createExpense,
    getExpensesForBuilding,
    getExpensesForMonth,
    getExpenseStats,
    getMonthlyProfitAnalysis,
    deleteExpense,
};