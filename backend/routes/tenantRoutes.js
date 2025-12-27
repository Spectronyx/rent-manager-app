// File: backend/routes/tenantRoutes.js

const express = require('express');
const router = express.Router();
const {
    createTenant,
    getAllTenants,
    getTenantById,
    getTenantsByBuilding,
    getTenantsByRoom,
    updateTenant,
    deleteTenant,
} = require('../controllers/tenantController');
const {
    uploadDocument,
    getDocuments,
    deleteDocument,
} = require('../controllers/documentController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Protect all routes
router.use(protect);

// Document routes
// Get documents (Admin or Tenant owner)
router.get('/:id/documents', getDocuments);

// Admin only routes
router.use(admin);

// Document management (Admin only)
router.post('/:id/documents', upload.single('document'), uploadDocument);
router.delete('/:id/documents/:documentId', deleteDocument);

router.route('/')
    .get(getAllTenants)
    .post(createTenant);

router.route('/:id')
    .get(getTenantById)
    .put(updateTenant)
    .delete(deleteTenant);

router.get('/building/:buildingId', getTenantsByBuilding);
router.get('/room/:roomId', getTenantsByRoom);

module.exports = router;
