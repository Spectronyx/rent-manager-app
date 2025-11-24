// File: frontend/src/api/buildingApi.js

import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/buildings`;

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

// Function to create a new building
export const createBuilding = async (buildingData) => {
    try {
        const res = await axiosInstance.post('/', buildingData);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Could not create building');
    }
};

export const getMyBuildings = async () => {
    try {
        const res = await axiosInstance.get('/');
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Could not fetch buildings');
    }
};

export const getBuildingById = async (id) => {
    try {
        const res = await axiosInstance.get(`/${id}`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Could not fetch building');
    }
};

// Delete building
export const deleteBuilding = async (id) => {
    try {
        const res = await axiosInstance.delete(`/${id}`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Could not delete building');
    }
};