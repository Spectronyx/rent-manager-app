// File: backend/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const {
    confirmPayment,
    getPaymentsForBuilding,
    getMyPayments,
    getAdminPaymentHistory,
} = require('../controllers/paymentController.js');
const {
    protect,
    admin
} = require('../middlewares/authMiddleware.js');



// --- Admin Only Routes ---
router.post('/confirm/:billId', protect, admin, confirmPayment);
router.get('/building/:buildingId', protect, admin, getPaymentsForBuilding);
router.get('/admin/all', protect, admin, getAdminPaymentHistory); // 2. Add route

// --- Student Route (protect-only) ---
router.get('/my', protect, getMyPayments); // 2. Add the new route

module.exports = router;