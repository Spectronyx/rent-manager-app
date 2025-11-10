// File: backend/routes/billRoutes.js

const express = require('express');
const router = express.Router();
const {
    generateBills,
    updateBillCharges,
    getBillsForBuilding,
    getMyCurrentBill,
    markBillAsPaidByStudent,
    getPendingBills,
} = require('../controllers/billController.js');
const {
    protect,
    admin
} = require('../middlewares/authMiddleware.js');

// --- Admin Only Routes ---
router.post('/generate/:buildingId', protect, admin, generateBills);
router.put('/:billId/charges', protect, admin, updateBillCharges);
router.get('/building/:buildingId', protect, admin, getBillsForBuilding);
router.get('/pending', protect, admin, getPendingBills);

// --- Student Only (Protected) Routes ---
// Note: We use 'protect' to get 'req.user', and the controller
//       handles the role-checking logic.
router.get('/mybill', protect, getMyCurrentBill);
router.put('/:billId/markpaid', protect, markBillAsPaidByStudent);

module.exports = router;