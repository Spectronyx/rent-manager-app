// File: backend/routes/financialRoutes.js

const express = require('express');
const router = express.Router();
const {
    getMonthlyStats,
    getBuildingFinancials,
    getRoomCollections
} = require('../controllers/financialController');
const { protect, admin } = require('../middlewares/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

router.get('/monthly', getMonthlyStats);
router.get('/building/:buildingId', getBuildingFinancials);
router.get('/rooms', getRoomCollections);

module.exports = router;
