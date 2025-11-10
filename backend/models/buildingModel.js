// File: backend/models/buildingModel.js

const mongoose = require('mongoose');

const buildingSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a building name'],
        trim: true,
    },
    address: {
        type: String,
        required: [true, 'Please add an address'],
    },
    // --- This is the relationship ---
    // Links this building to the User (admin) who manages it.
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // This 'User' must match the model name we exported
    },
}, {
    timestamps: true,
});

const Building = mongoose.model('Building', buildingSchema);

module.exports = Building;