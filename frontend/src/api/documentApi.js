// File: frontend/src/api/documentApi.js

import axios from 'axios';

const API_URL = 'http://localhost:4000/api/documents'; // Using 5001 as we planned

export const uploadDocument = async (userId, documentType, file) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('documentType', documentType);
    formData.append('document', file);

    try {
        const res = await axios.post(API_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    } catch (error) {
        // --- THIS IS THE FIX ---
        // Check if error.response and error.response.data exist before reading them.
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
            error.message || // Fallback to the general error message
            'File upload failed';
        throw new Error(message);
        // --- END OF FIX ---
    }
};

// GET /api/documents/my (for students)
export const getMyDocuments = async () => {
    try {
        const res = await axios.get(`${API_URL}/my`);
        return res.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Could not fetch documents');
    }
};

// GET /api/documents/:userId (for admins)
export const getDocumentsForUser = async (userId) => {
    try {
        const res = await axios.get(`${API_URL}/${userId}`);
        return res.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Could not fetch documents');
    }
};