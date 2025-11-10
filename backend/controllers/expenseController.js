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
        date
    } = req.body;
    const adminId = req.user._id;

    if (!buildingId || !category || !amount || !description) {
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
        date: date || Date.now(),
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
        date: -1
    });
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

module.exports = {
    createExpense,
    getExpensesForBuilding,
    getExpenseStats,
};