// File: frontend/src/api/roomApi.js

import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/rooms`;

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

// POST /api/rooms
export const createRoom = async (roomData) => {
    try {
        const res = await axiosInstance.post('/', roomData);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Could not create room');
    }
};

// GET /api/rooms/building/:buildingId
export const getRoomsInBuilding = async (buildingId) => {
    try {
        const res = await axiosInstance.get(`/building/${buildingId}`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Could not fetch rooms');
    }
};

export const assignTenantToRoom = async (roomId, tenantId) => {
    try {
        const res = await axiosInstance.put(`/${roomId}/assign`, { tenantId });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Could not assign tenant');
    }
};

export const vacateRoom = async (roomId) => {
    try {
        const res = await axiosInstance.put(`/${roomId}/vacate`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Could not vacate room');
    }
};