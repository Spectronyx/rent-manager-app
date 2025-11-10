// File: backend/controllers/buildingController.js

const asyncHandler = require('express-async-handler');
const Building = require('../models/buildingModel.js');

// @desc    Create a new building
// @route   POST /api/buildings
// @access  Private/Admin
const createBuilding = asyncHandler(async (req, res) => {
    // 1. Get the data from the request body
    const {
        name,
        address
    } = req.body;

    // 2. We get 'req.user' from our 'protect' middleware!
    //    This is the logged-in admin.
    const adminId = req.user._id;

    // 3. Check if a building with this name already exists for this admin
    const buildingExists = await Building.findOne({
        name,
        adminId
    });
    if (buildingExists) {
        res.status(400);
        throw new Error('You already have a building with this name');
    }

    // 4. Create the new building
    const building = await Building.create({
        name,
        address,
        adminId,
    });

    // 5. Send back the created building
    if (building) {
        res.status(201).json(building);
    } else {
        res.status(400);
        throw new Error('Invalid building data');
    }
});

// @desc    Get all buildings for the logged-in admin
// @route   GET /api/buildings
// @access  Private/Admin
const getMyBuildings = asyncHandler(async (req, res) => {
    // Find all buildings where the adminId matches the logged-in user's ID
    const buildings = await Building.find({
        adminId: req.user._id
    });
    res.json(buildings);
});

// @desc    Get a single building by its ID
// @route   GET /api/buildings/:id
// @access  Private/Admin
const getBuildingById = asyncHandler(async (req, res) => {
    const building = await Building.findById(req.params.id);

    if (building) {
        // Optional: Check if the admin owns this building
        if (building.adminId.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to view this building');
        }
        res.json(building);
    } else {
        res.status(404);
        throw new Error('Building not found');
    }
});

// @desc    Update a building
// @route   PUT /api/buildings/:id
// @access  Private/Admin
const updateBuilding = asyncHandler(async (req, res) => {
    const building = await Building.findById(req.params.id);

    if (building) {
        // Check if the admin owns this building
        if (building.adminId.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this building');
        }

        // Update the fields
        building.name = req.body.name || building.name;
        building.address = req.body.address || building.address;

        const updatedBuilding = await building.save();
        res.json(updatedBuilding);
    } else {
        res.status(404);
        throw new Error('Building not found');
    }
});

// @desc    Delete a building
// @route   DELETE /api/buildings/:id
// @access  Private/Admin
const deleteBuilding = asyncHandler(async (req, res) => {
    const building = await Building.findById(req.params.id);

    if (building) {
        // Check if the admin owns this building
        if (building.adminId.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this building');
        }

        await building.deleteOne();
        res.json({
            message: 'Building removed'
        });
    } else {
        res.status(404);
        throw new Error('Building not found');
    }
});

module.exports = {
    createBuilding,
    getMyBuildings,
    getBuildingById,
    updateBuilding,
    deleteBuilding,
};