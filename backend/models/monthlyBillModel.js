// File: backend/models/monthlyBillModel.js

const mongoose = require('mongoose');

const monthlyBillSchema = mongoose.Schema({
    // --- Relationships ---
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Room',
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },

    // --- Bill Period ---
    month: {
        type: Number, // e.g., 10 for October
        required: true,
    },
    year: {
        type: Number, // e.g., 2025
        required: true,
    },

    // --- Itemized Charges ---
    rent: {
        type: Number,
        required: true,
    },
    electricityBill: {
        type: Number,
        default: 0,
    },
    otherCharges: {
        type: Number,
        default: 0,
    },
    previousDues: {
        type: Number,
        default: 0,
    },

    // --- Totals and Status ---
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: [
            'Pending', // Newly created, waiting for student to pay
            'PaymentPendingConfirmation', // Student clicked "I paid", admin must verify
            'Paid', // Admin confirmed payment
            'Overdue', // Past due date
        ],
        default: 'Pending',
    },
}, {
    timestamps: true,
});

const MonthlyBill = mongoose.model('MonthlyBill', monthlyBillSchema);

module.exports = MonthlyBill;