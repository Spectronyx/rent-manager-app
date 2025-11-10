// File: backend/models/documentModel.js

const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
    // --- Relationship: Which user does this belong to? ---
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    documentType: {
        type: String,
        required: [true, 'Please add a document type (e.g., Aadhar, ID Card)'],
    },
    // This is the CRITICAL field. We store the URL, not the file itself.
    fileUrl: {
        type: String,
        required: true,
    },
    // We'll add a 'status' for admin to approve the document
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
}, {
    timestamps: true,
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;