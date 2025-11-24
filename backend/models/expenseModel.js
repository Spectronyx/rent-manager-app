// File: backend/models/expenseModel.js

const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema({
    // --- Relationship: Which building had this expense? ---
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Building',
    },
    // --- Relationship: Which admin logged this? ---
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['maintenance', 'electricity', 'water', 'salaries', 'repairs', 'cleaning', 'security', 'taxes', 'other'],
    },
    amount: {
        type: Number,
        required: [true, 'Please add the expense amount'],
        min: 0,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
    },
    year: {
        type: Number,
        required: true,
    },
    expenseDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    notes: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

// Index for faster queries
expenseSchema.index({ buildingId: 1, month: 1, year: 1 });
expenseSchema.index({ adminId: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;