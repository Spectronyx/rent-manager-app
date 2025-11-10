// File: backend/controllers/roomController.js

const asyncHandler = require('express-async-handler');
const Room = require('../models/roomModel.js');
const Building = require('../models/buildingModel.js');
const User = require('../models/userModels.js');

// --- Helper function to check admin ownership of a building ---
const checkAdminOwnership = async (buildingId, adminId) => {
    const building = await Building.findById(buildingId);
    if (!building) {
        throw new Error('Building not found');
    }
    if (building.adminId.toString() !== adminId.toString()) {
        throw new Error('Not authorized to manage this building');
    }
    return true;
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private/Admin
const createRoom = asyncHandler(async (req, res) => {
    // 1. Get data from body
    const {
        roomNumber,
        monthlyRent,
        status,
        buildingId
    } = req.body;

    try {
        // 2. Verify admin owns the building
        await checkAdminOwnership(buildingId, req.user._id);

        // 3. Create the room
        const room = await Room.create({
            roomNumber,
            monthlyRent,
            status,
            buildingId,
            tenantId: null, // Starts as vacant
        });

        res.status(201).json(room);
    } catch (error) {
        res.status(401);
        throw new Error(error.message);
    }
});

// @desc    Get all rooms for a specific building
// @route   GET /api/rooms/building/:buildingId
// @access  Private/Admin
const getRoomsInBuilding = asyncHandler(async (req, res) => {
    const {
        buildingId
    } = req.params;

    try {
        // 1. Verify admin owns the building
        await checkAdminOwnership(buildingId, req.user._id);

        // 2. Find all rooms for that building
        // We use .populate() to also fetch the tenant's name!
        const rooms = await Room.find({
            buildingId
        }).populate(
            'tenantId',
            'name email'
        );

        res.json(rooms);
    } catch (error) {
        res.status(401);
        throw new Error(error.message);
    }
});

// @desc    Get a single room by ID
// @route   GET /api/rooms/:id
// @access  Private/Admin
const getRoomById = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id).populate(
        'tenantId',
        'name email phone'
    );

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    // Optional: Check ownership of the room's building
    // await checkAdminOwnership(room.buildingId, req.user._id);

    res.json(room);
});

// @desc    Update a room (e.g., change rent)
// @route   PUT /api/rooms/:id
// @access  Private/Admin
const updateRoom = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    // Check ownership
    await checkAdminOwnership(room.buildingId, req.user._id);

    room.roomNumber = req.body.roomNumber || room.roomNumber;
    room.monthlyRent = req.body.monthlyRent || room.monthlyRent;
    room.status = req.body.status || room.status;

    const updatedRoom = await room.save();
    res.json(updatedRoom);
});

// @desc    Assign a tenant to a room ("Move In")
// @route   PUT /api/rooms/:id/assign
// @access  Private/Admin
const assignTenantToRoom = asyncHandler(async (req, res) => {
    const {
        tenantId
    } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    // Check ownership
    await checkAdminOwnership(room.buildingId, req.user._id);

    // Check if tenant exists
    const tenant = await User.findById(tenantId);
    if (!tenant || tenant.role !== 'student') {
        res.status(404);
        throw new Error('Student (tenant) not found');
    }

    // Check if room is already occupied
    if (room.status === 'Occupied' && room.tenantId) {
        res.status(400);
        throw new Error('Room is already occupied');
    }

    room.tenantId = tenantId;
    room.status = 'Occupied';

    const updatedRoom = await room.save();
    res.json(updatedRoom);
});

// @desc    Remove a tenant from a room ("Move Out")
// @route   PUT /api/rooms/:id/vacate
// @access  Private/Admin
const vacateRoom = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    // Check ownership
    await checkAdminOwnership(room.buildingId, req.user._id);

    room.tenantId = null;
    room.status = 'Vacant';

    const updatedRoom = await room.save();
    res.json(updatedRoom);
});

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    // Check ownership
    await checkAdminOwnership(room.buildingId, req.user._id);

    // TODO: Add check - don't delete if room has active tenant or unpaid bills?
    // For now, we'll allow it.

    await room.deleteOne();
    res.json({
        message: 'Room removed'
    });
});


module.exports = {
    createRoom,
    getRoomsInBuilding,
    getRoomById,
    updateRoom,
    assignTenantToRoom,
    vacateRoom,
    deleteRoom
};