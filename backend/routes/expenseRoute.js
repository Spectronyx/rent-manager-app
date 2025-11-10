// File: backend/routes/expenseRoutes.js

const express = require('express');
const router = express.Router();
const {
    createExpense,
    getExpensesForBuilding,
    getExpenseStats,
} = require('../controllers/expenseController.js');
const {
    protect,
    admin
} = require('../middlewares/authMiddleware.js');


// Apply admin protection to all routes in this file
router.use(protect, admin);

// POST /api/expenses
router.route('/').post(createExpense);

// GET /api/expenses/building/:buildingId
router.route('/stats/:buildingId').get(getExpenseStats); // For the total
router.route('/building/:buildingId').get(getExpensesForBuilding);

module.exports = router;