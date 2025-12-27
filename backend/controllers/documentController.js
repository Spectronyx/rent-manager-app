const asyncHandler = require('express-async-handler');
const Tenant = require('../models/tenantModel');
const cloudinary = require('../config/cloudinaryConfig');
const fs = require('fs');

// @desc    Upload a document for a tenant
// @route   POST /api/tenants/:id/documents
// @access  Private/Admin
const uploadDocument = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
        res.status(404);
        throw new Error('Tenant not found');
    }

    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a file');
    }

    try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'rent-manager/documents',
            resource_type: 'auto',
            type: 'authenticated', // Private/Authenticated access
            access_mode: 'authenticated'
        });

        // Remove file from local uploads folder
        fs.unlinkSync(req.file.path);

        const newDocument = {
            name: req.body.name || req.file.originalname,
            type: req.body.type || 'Other',
            url: result.secure_url, // Store base URL, but we will sign it on retrieval
            publicId: result.public_id,
            uploadedBy: req.user._id,
        };

        tenant.documents.push(newDocument);
        await tenant.save();

        // Return the document with a temporary download URL immediately
        const downloadUrl = cloudinary.utils.private_download_url(newDocument.publicId, 'pdf', {
            resource_type: 'image',
            type: 'authenticated',
            expires_at: Math.floor(Date.now() / 1000) + 3600
        });

        const responseDoc = newDocument;
        responseDoc.url = downloadUrl;

        res.status(201).json(responseDoc);
    } catch (error) {
        // Remove file if upload fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500);
        throw new Error('File upload failed: ' + error.message);
    }
});

// @desc    Get all documents for a tenant
// @route   GET /api/tenants/:id/documents
// @access  Private
const getDocuments = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
        res.status(404);
        throw new Error('Tenant not found');
    }

    // Check authorization
    if (req.user.role !== 'admin' && req.user.email !== tenant.email) {
        res.status(403);
        throw new Error('Not authorized to view these documents');
    }

    // Generate SIGNED URLs for all documents
    // Generate secure download URLs for all documents
    const docs = tenant.documents.map(doc => {
        const docObj = doc.toObject();

        // Determine type based on stored URL
        const isAuthenticated = doc.url.includes('/authenticated/');
        const type = isAuthenticated ? 'authenticated' : 'upload';

        // Determine format from URL or default to pdf
        const format = doc.url.split('.').pop() || 'pdf';

        // Generate private download URL
        // This works for both authenticated and restricted public assets
        docObj.url = cloudinary.utils.private_download_url(doc.publicId, format, {
            resource_type: 'image',
            type: type,
            expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour validity
        });

        return docObj;
    });

    res.json(docs);
});

// @desc    Delete a document
// @route   DELETE /api/tenants/:id/documents/:documentId
// @access  Private/Admin
const deleteDocument = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
        res.status(404);
        throw new Error('Tenant not found');
    }

    const document = tenant.documents.id(req.params.documentId);

    if (!document) {
        res.status(404);
        throw new Error('Document not found');
    }

    try {
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(document.publicId);

        // Remove from array
        // document.remove(); // Deprecated in Mongoose 6+?
        // Use pull
        tenant.documents.pull(document._id);
        await tenant.save();

        res.json({ message: 'Document removed' });
    } catch (error) {
        res.status(500);
        throw new Error('Delete failed: ' + error.message);
    }
});

module.exports = {
    uploadDocument,
    getDocuments,
    deleteDocument,
};