// File: backend/models/rentRecordModel.js

const mongoose = require('mongoose');

const rentRecordSchema = mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        required: true,
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
    amount: {
        type: Number,
        required: true,
    },
    electricityUnits: {
        type: Number,
        default: 0,
    },
    electricityBill: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidDate: {
        type: Date,
        default: null,
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'upi', 'bank_transfer', 'cheque', null],
        default: null,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    notes: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

// Create compound index to prevent duplicate records
rentRecordSchema.index({ tenantId: 1, month: 1, year: 1 }, { unique: true });

const RentRecord = mongoose.model('RentRecord', rentRecordSchema);

module.exports = RentRecord;
