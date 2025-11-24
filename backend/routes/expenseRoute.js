// File: backend/routes/expenseRoutes.js

const express = require('express');
const router = express.Router();
const {
    createExpense,
    getExpensesForBuilding,
    getExpensesForMonth,
    getExpenseStats,
    getMonthlyProfitAnalysis,
    deleteExpense,
} = require('../controllers/expenseController.js');
const {
    protect,
    admin
} = require('../middlewares/authMiddleware.js');


// Apply admin protection to all routes in this file
router.use(protect, admin);

// POST /api/expenses
router.route('/').post(createExpense);

// GET /api/expenses/profit-analysis
router.get('/profit-analysis', getMonthlyProfitAnalysis);

// GET /api/expenses/month/:year/:month
router.get('/month/:year/:month', getExpensesForMonth);

// GET /api/expenses/building/:buildingId
router.route('/stats/:buildingId').get(getExpenseStats); // For the total
router.route('/building/:buildingId').get(getExpensesForBuilding);

// DELETE /api/expenses/:id
router.delete('/:id', deleteExpense);

module.exports = router;