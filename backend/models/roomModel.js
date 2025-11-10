// File: backend/models/roomModel.js

const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
    roomNumber: {
        type: String,
        required: [true, 'Please add a room number (e.g., 101-A)'],
        trim: true,
    },
    monthlyRent: {
        type: Number,
        required: [true, 'Please add the base monthly rent'],
    },
    status: {
        type: String,
        required: true,
        enum: ['Vacant', 'Occupied', 'Under Maintenance'],
        default: 'Vacant',
    },
    // --- Relationship 1: Belongs to a Building ---
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Building', // References the 'Building' model
    },
    // --- Relationship 2: Belongs to a Tenant (User) ---
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the 'User' model
        default: null, // A room can be vacant, so it can have no tenant
    },
}, {
    timestamps: true,
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;