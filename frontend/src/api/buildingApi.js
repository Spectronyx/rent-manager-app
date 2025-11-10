// File: frontend/src/api/buildingApi.js

import axios from 'axios';

const API_URL = 'http://localhost:4000/api/buildings';

// Function to create a new building
export const createBuilding = async (buildingData) => {
    try {
        // Our 'AuthContext' already set the 'Authorization: Bearer <token>' header
        const res = await axios.post(API_URL, buildingData);
        return res.data;
    } catch (error) {
        // Throw the error's message
        throw new Error(error.response.data.message || 'Could not create building');
    }
};

export const getMyBuildings = async () => {
    try {
        // GET request to our backend's /api/buildings
        const res = await axios.get(API_URL);
        return res.data; // This will be the array of buildings
    } catch (error) {
        throw new Error(error.response.data.message || 'Could not fetch buildings');
    }
};

export const getBuildingById = async (id) => {
    try {
        const res = await axios.get(`${API_URL}/${id}`);
        return res.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Could not fetch building');
    }
};
// We'll add more functions here later, like getMyBuildings()