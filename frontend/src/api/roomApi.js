// File: frontend/src/api/roomApi.js

import axios from 'axios';

// Note the URL path!
const API_URL = `${import.meta.env.VITE_API_URL}/api/rooms`;

// POST /api/rooms
export const createRoom = async (roomData) => {
    try {
        const res = await axios.post(API_URL, roomData);
        return res.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Could not create room');
    }
};

// GET /api/rooms/building/:buildingId
export const getRoomsInBuilding = async (buildingId) => {
    try {
        const res = await axios.get(`${API_URL}/building/${buildingId}`);
        return res.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Could not fetch rooms');
    }
};

export const assignTenantToRoom = async (roomId, tenantId) => {
    try {
        const res = await axios.put(
            `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/assign`, {
                tenantId
            } // The { tenantId } is the request 'body'
        );
        return res.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Could not assign tenant');
    }
};

export const vacateRoom = async (roomId) => {
    try {
        // This endpoint doesn't need a 'body', just the URL
        const res = await axios.put(
            `${import.meta.env.VITE_API_URL}/${roomId}/vacate`
        );
        return res.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Could not vacate room');
    }
};