// File: frontend/src/api/expenseApi.js

import axios from 'axios';

// Use your correct port
const API_URL = `${import.meta.env.VITE_API_URL}/api/expenses`;

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

// GET /api/expenses/month/:year/:month
export const getExpensesForMonth = async (year, month, buildingId) => {
    try {
        const params = buildingId ? `?buildingId=${buildingId}` : '';
        const res = await axios.get(`${API_URL}/month/${year}/${month}${params}`);
        return res.data;
    } catch (error) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            'Could not fetch expenses for month';
        throw new Error(message);
    }
};

// GET /api/expenses/profit-analysis
export const getMonthlyProfitAnalysis = async (months = 6, buildingId) => {
    try {
        const params = new URLSearchParams();
        params.append('months', months);
        if (buildingId) params.append('buildingId', buildingId);

        const res = await axios.get(`${API_URL}/profit-analysis?${params.toString()}`);
        return res.data;
    } catch (error) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            'Could not fetch profit analysis';
        throw new Error(message);
    }
};