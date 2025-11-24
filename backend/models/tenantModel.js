// File: backend/models/tenantModel.js

const mongoose = require('mongoose');

const tenantSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add tenant name'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Please add phone number'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please add email'],
        trim: true,
        lowercase: true,
    },
    aadharNo: {
        type: String,
        required: [true, 'Please add Aadhar number'],
        trim: true,
        minlength: 12,
        maxlength: 12,
    },
    collegeId: {
        type: String,
        required: [true, 'Please add college ID'],
        trim: true,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        default: null,
    },
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        default: null,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, {
    timestamps: true,
});

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;
