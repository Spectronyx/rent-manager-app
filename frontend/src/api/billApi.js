// File: frontend/src/api/billApi.js

import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/bills`;

// GET /api/bills/mybill
export const getMyCurrentBill = async () => {
    try {
        // Auth header is already set
        const res = await axios.get(`${API_URL}/mybill`);
        return res.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            // This isn't really an "error" - it just means no bill was found.
            // We'll return null to let the component handle it.
            return null;
        }
        throw new Error(error.response.data.message || 'Could not fetch bill');
    }
};

// PUT /api/bills/:billId/markpaid
export const markBillAsPaid = async (billId) => {
    try {
        const res = await axios.put(`${API_URL}/${billId}/markpaid`);
        return res.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Could not mark bill as paid');
    }
};

// GET /api/bills/pending
export const getPendingBills = async () => {
    try {
        const res = await axios.get(`${API_URL}/pending`);
        return res.data;
    } catch (error) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            'Could not fetch pending bills';
        throw new Error(message);
    }
};

// POST /api/bills/generate/:buildingId
export const generateBills = async (buildingId, month, year) => {
    try {
        const res = await axios.post(
            `${API_URL}/generate/${buildingId}`, {
                month,
                year
            } // Send month and year in the body
        );
        return res.data; // e.g., { message: "Bill generation complete..." }
    } catch (error) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            'Could not generate bills';
        throw new Error(message);
    }
};

// --- 1. ADD THIS NEW FUNCTION ---
// PUT /api/bills/:billId/charges
export const updateBillCharges = async (billId, charges) => {
    // charges will be an object like { electricityBill: 500, otherCharges: 100 }
    try {
        const res = await axios.put(`${API_URL}/${billId}/charges`, charges);
        return res.data;
    } catch (error) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            'Could not update bill';
        throw new Error(message);
    }
};

// --- 2. CREATE THIS NEW FUNCTION ---
// GET /api/bills/building/:buildingId?status=Pending
export const getPendingBillsForBuilding = (buildingId) => {
    return axios.get(`${API_URL}/building/${buildingId}`, {
        params: {
            status: 'Pending'
        },
    });
    // We just return the promise here
};