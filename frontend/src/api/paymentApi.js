// File: frontend/src/api/paymentApi.js

import axios from 'axios';

// Use your correct port
const API_URL = `${import.meta.env.VITE_API_URL}/api/payments`;

// POST /api/payments/confirm/:billId
export const confirmPayment = async (billId, amount, paymentMethod) => {
    try {
        const res = await axios.post(
            `${API_URL}/confirm/${billId}`, {
                amount,
                paymentMethod
            } // Send the body
        );
        return res.data;
    } catch (error) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            'Could not confirm payment';
        throw new Error(message);
    }
};
// GET /api/payments/my
export const getMyPayments = async () => {
    try {
        const res = await axios.get(`${API_URL}/my`);
        return res.data;
    } catch (error) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            'Could not fetch payment history';
        throw new Error(message);
    }
};

export const getAdminPaymentHistory = async () => {
    try {
        const res = await axios.get(`${API_URL}/admin/all`);
        return res.data;
    } catch (error) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            'Could not fetch payment history';
        throw new Error(message);
    }
};