// File: frontend/src/api/rentRecordApi.js

import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/rent-records`;

// Get auth token from localStorage
const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token;
};

// Create axios instance with auth
const axiosInstance = axios.create({
    baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Get all rent records with filters
export const getAllRentRecords = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    if (filters.buildingId) params.append('buildingId', filters.buildingId);
    if (filters.isPaid !== undefined) params.append('isPaid', filters.isPaid);

    const response = await axiosInstance.get(`/?${params.toString()}`);
    return response.data;
};

// Get rent records for a specific tenant
export const getTenantRentRecords = async (tenantId) => {
    const response = await axiosInstance.get(`/tenant/${tenantId}`);
    return response.data;
};

// Create rent record
export const createRentRecord = async (recordData) => {
    const response = await axiosInstance.post('/', recordData);
    return response.data;
};

// Update payment status
export const updatePaymentStatus = async (recordId, isPaid, notes = '') => {
    const response = await axiosInstance.put(`/${recordId}/payment`, { isPaid, notes });
    return response.data;
};

// Generate monthly records for all tenants
export const generateMonthlyRecords = async (month, year, buildingId, electricityRatePerUnit, roomElectricity) => {
    const response = await axiosInstance.post('/generate', {
        month,
        year,
        buildingId,
        electricityRatePerUnit,
        roomElectricity
    });
    return response.data;
};

// Generate bill for a specific room
export const generateRoomBill = async (roomId, month, year, electricityUnits, electricityRatePerUnit) => {
    const response = await axiosInstance.post('/generate/room', {
        roomId,
        month,
        year,
        electricityUnits,
        electricityRatePerUnit
    });
    return response.data;
};

// Mark bill as paid
export const markBillAsPaid = async (recordId, paymentMethod, paidDate, notes = '') => {
    const response = await axiosInstance.put(`/${recordId}/pay`, {
        paymentMethod,
        paidDate,
        notes
    });
    return response.data;
};

// Get all pending bills
export const getPendingBills = async (buildingId) => {
    const params = buildingId ? `?buildingId=${buildingId}` : '';
    const response = await axiosInstance.get(`/pending${params}`);
    return response.data;
};

// Get bills for a specific month
export const getBillsForMonth = async (year, month, buildingId) => {
    const params = buildingId ? `?buildingId=${buildingId}` : '';
    const response = await axiosInstance.get(`/month/${year}/${month}${params}`);
    return response.data;
};

// Delete rent record
export const deleteRentRecord = async (recordId) => {
    const response = await axiosInstance.delete(`/${recordId}`);
    return response.data;
};
