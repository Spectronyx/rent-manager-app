// File: frontend/src/api/financialApi.js

import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/financial`;

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

// Get monthly statistics
export const getMonthlyStats = async (month, year, period) => {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    if (period) params.period = period;

    const response = await axiosInstance.get('/monthly', { params });
    return response.data;
};

// Get building financials
export const getBuildingFinancials = async (buildingId) => {
    const response = await axiosInstance.get(`/building/${buildingId}`);
    return response.data;
};

// Get room collections
export const getRoomCollections = async () => {
    const response = await axiosInstance.get('/rooms');
    return response.data;
};
