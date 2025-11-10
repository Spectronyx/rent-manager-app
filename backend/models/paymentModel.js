// File: backend/models/paymentModel.js

const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    // --- Relationships ---
    billId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'MonthlyBill', // Links directly to the invoice it paid
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // The user who paid
    },

    // --- Transaction Details ---
    amount: {
        type: Number,
        required: true,
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'Cash', 'Bank Transfer'],
        default: 'UPI',
    },
    // Admin confirms this payment
    status: {
        type: String,
        enum: ['Confirmed', 'Failed'],
        default: 'Confirmed',
    },
}, {
    timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;