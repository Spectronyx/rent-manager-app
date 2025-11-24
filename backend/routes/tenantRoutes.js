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
const { protect, admin } = require('../middlewares/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

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
