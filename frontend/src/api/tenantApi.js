// File: frontend/src/api/tenantApi.js

import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/tenants`;

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

// Create tenant
export const createTenant = async (tenantData) => {
    const response = await axiosInstance.post('/', tenantData);
    return response.data;
};

// Get all tenants
export const getAllTenants = async () => {
    const response = await axiosInstance.get('/');
    return response.data;
};

// Get tenant by ID
export const getTenantById = async (id) => {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
};

// Get tenants by building
export const getTenantsByBuilding = async (buildingId) => {
    const response = await axiosInstance.get(`/building/${buildingId}`);
    return response.data;
};

// Get tenants by room
export const getTenantsByRoom = async (roomId) => {
    const response = await axiosInstance.get(`/room/${roomId}`);
    return response.data;
};

// Update tenant
export const updateTenant = async (id, tenantData) => {
    const response = await axiosInstance.put(`/${id}`, tenantData);
    return response.data;
};

// Delete tenant
export const deleteTenant = async (id) => {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
};
