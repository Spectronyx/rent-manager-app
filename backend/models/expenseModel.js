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
        required: [true, 'Please add a category (e.g., Electricity, Maintenance)'],
    },
    amount: {
        type: Number,
        required: [true, 'Please add the expense amount'],
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;