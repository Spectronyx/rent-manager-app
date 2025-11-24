// File: backend/routes/rentRecordRoutes.js

const express = require('express');
const router = express.Router();
const {
    getAllRentRecords,
    getTenantRentRecords,
    createRentRecord,
    updatePaymentStatus,
    generateMonthlyRecords,
    generateRoomBill,
    markBillAsPaid,
    getPendingBills,
    getBillsForMonth,
    deleteRentRecord,
} = require('../controllers/rentRecordController');
const { protect, admin } = require('../middlewares/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

router.route('/')
    .get(getAllRentRecords)
    .post(createRentRecord);

router.post('/generate', generateMonthlyRecords);
router.post('/generate/room', generateRoomBill);

router.get('/pending', getPendingBills);
router.get('/month/:year/:month', getBillsForMonth);

router.route('/:id')
    .delete(deleteRentRecord);

router.put('/:id/payment', updatePaymentStatus);
router.put('/:id/pay', markBillAsPaid);

router.get('/tenant/:tenantId', getTenantRentRecords);

module.exports = router;
