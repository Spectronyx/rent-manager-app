// File: frontend/src/api/expenseApi.js

import axios from 'axios';

// Use your correct port
const API_URL = 'http://localhost:4000/api/expenses';

// POST /api/expenses
export const createExpense = async (expenseData) => {
    // expenseData = { buildingId, category, amount, description }
    try {
        const res = await axios.post(API_URL, expenseData);
        return res.data;
    } catch (error) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            'Could not create expense';
        throw new Error(message);
    }
};

// GET /api/expenses/building/:buildingId
export const getExpensesForBuilding = async (buildingId) => {
    try {
        const res = await axios.get(`${API_URL}/building/${buildingId}`);
        return res.data;
    } catch (error) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            'Could not fetch expenses';
        throw new Error(message);
    }
};

export const getExpenseStats = async (buildingId) => {
    try {
        const res = await axios.get(`${API_URL}/stats/${buildingId}`);
        return res.data; // This will be { _id: ..., totalExpenses: 1500, count: 2 }
    } catch (error) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            'Could not fetch expense stats';
        throw new Error(message);
    }
};