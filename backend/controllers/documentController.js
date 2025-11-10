// File: backend/controllers/documentController.js

const fs = require('fs'); // Node.js File System module
const asyncHandler = require('express-async-handler');
const Document = require('../models/documentModel.js');
const cloudinary = require('../config/cloudinary.js'); // Our Cloudinary config
const path = require('path'); // <-- 1. IMPORT 'path'


// @desc    Upload a document
// @route   POST /api/documents
// @access  Private/Admin
const uploadDocument = asyncHandler(async (req, res) => {
    // 1. Check if a file was caught by multer
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a file');
    }

    // 2. Get data from the form body
    const {
        userId,
        documentType
    } = req.body;
    if (!userId || !documentType) {
        res.status(400);
        throw new Error('User ID and Document Type are required');
    }

    const absolutePath = path.join(__dirname, '../', req.file.path);

    try {
        // 3. Upload the file from our local 'uploads' folder to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'rent-manager-documents', // Optional: creates a folder in Cloudinary
            resource_type: 'auto', // Detects if it's PDF, JPG, etc.
        });

        // 4. Create the new document in our database
        const document = await Document.create({
            userId: userId,
            documentType: documentType,
            fileUrl: result.secure_url, // The URL from Cloudinary
            status: 'Approved', // Or 'Pending' if you want
        });

        // 5. IMPORTANT: Delete the temporary file from our 'uploads' folder
        fs.unlinkSync(req.file.path);

        // 6. Send the successful response
        res.status(201).json(document);
    } catch (error) {
        // 5b. If upload fails, still delete the temp file
        fs.unlinkSync(req.file.path);
        res.status(500);
        throw new Error('File upload failed. ' + error.message);
    }
});

// @desc    Get documents for a specific user (for admin)
// @route   GET /api/documents/:userId
// @access  Private/Admin
const getDocumentsForUser = asyncHandler(async (req, res) => {
    const documents = await Document.find({
        userId: req.params.userId
    });
    res.json(documents);
});

// @desc    Get logged-in student's own documents
// @route   GET /api/documents/my
// @access  Private
const getMyDocuments = asyncHandler(async (req, res) => {
    const documents = await Document.find({
        userId: req.user._id
    });
    res.json(documents);
});

module.exports = {
    uploadDocument,
    getDocumentsForUser,
    getMyDocuments,
};