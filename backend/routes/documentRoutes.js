// File: backend/routes/documentRoutes.js

const express = require('express');
const router = express.Router();
const {
    uploadDocument,
    getDocumentsForUser,
    getMyDocuments,
} = require('../controllers/documentController.js');
const {
    protect,
    admin
} = require('../middlewares/authMiddleware.js');
const upload = require('../middlewares/uploadMiddleware.js'); // Our multer "catcher"

// --- Route Definitions ---

// GET /api/documents/my (Student route)
// Must be *before* the '/:userId' route!
router.get('/my', protect, getMyDocuments);

// POST /api/documents (Admin route)
// This is the multi-middleware route!
router.post(
    '/',
    protect, // 1. Is user logged in?
    admin, // 2. Is user an admin?
    upload.single('document'), // 3. Catch the file named 'document'
    uploadDocument // 4. Run the controller
);

// GET /api/documents/:userId (Admin route)
router.get('/:userId', protect, admin, getDocumentsForUser);

module.exports = router;