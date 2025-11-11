// File: frontend/src/api/userApi.js

import axios from 'axios';

// Note: The URL is /api/users
const API_URL = `${import.meta.env.VITE_API_URL}/api/users`;

// GET /api/users (gets all students)
export const getAllStudents = async () => {
    try {
        // Auth header is already set by AuthContext
        const res = await axios.get(API_URL);
        return res.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Could not fetch students');
    }
};

// --- ADD THIS NEW FUNCTION ---
// POST /api/users/admin
export const createAdmin = async (adminData) => {
    // adminData = { name, email, password, phone }
    try {
        // Auth header is already set
        const res = await axios.post(`${API_URL}/admin`, adminData);
        return res.data;
    } catch (error) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message ||
            'Could not create admin';
        throw new Error(message);
    }
};