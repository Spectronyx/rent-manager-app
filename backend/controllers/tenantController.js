// File: backend/controllers/tenantController.js

const asyncHandler = require('express-async-handler');
const Tenant = require('../models/tenantModel');
const Room = require('../models/roomModel');
const Building = require('../models/buildingModel');

// @desc    Create new tenant
// @route   POST /api/tenants
// @access  Private/Admin
const createTenant = asyncHandler(async (req, res) => {
    const { name, phone, email, aadharNo, collegeId, roomId, buildingId } = req.body;

    // Validation
    if (!name || !phone || !email || !aadharNo || !collegeId) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    // Check if room exists and is available
    if (roomId) {
        const room = await Room.findById(roomId);
        if (!room) {
            res.status(404);
            throw new Error('Room not found');
        }
        if (room.status === 'Occupied') {
            res.status(400);
            throw new Error('Room is already occupied');
        }
    }

    // Create tenant
    const tenant = await Tenant.create({
        name,
        phone,
        email,
        aadharNo,
        collegeId,
        roomId: roomId || null,
        buildingId: buildingId || null,
    });

    // Update room status if assigned
    if (roomId) {
        await Room.findByIdAndUpdate(roomId, {
            status: 'Occupied',
            tenantId: tenant._id,
        });
    }

    res.status(201).json(tenant);
});

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Private/Admin
const getAllTenants = asyncHandler(async (req, res) => {
    const tenants = await Tenant.find()
        .populate('roomId', 'roomNumber')
        .populate('buildingId', 'name')
        .sort('-createdAt');

    res.status(200).json(tenants);
});

// @desc    Get tenant by ID
// @route   GET /api/tenants/:id
// @access  Private/Admin
const getTenantById = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findById(req.params.id)
        .populate('roomId')
        .populate('buildingId');

    if (!tenant) {
        res.status(404);
        throw new Error('Tenant not found');
    }

    res.status(200).json(tenant);
});

// @desc    Get tenants by building
// @route   GET /api/tenants/building/:buildingId
// @access  Private/Admin
const getTenantsByBuilding = asyncHandler(async (req, res) => {
    const tenants = await Tenant.find({ buildingId: req.params.buildingId })
        .populate('roomId', 'roomNumber')
        .sort('name');

    res.status(200).json(tenants);
});

// @desc    Get tenants by room
// @route   GET /api/tenants/room/:roomId
// @access  Private/Admin
const getTenantsByRoom = asyncHandler(async (req, res) => {
    const tenants = await Tenant.find({ roomId: req.params.roomId });

    res.status(200).json(tenants);
});

// @desc    Update tenant
// @route   PUT /api/tenants/:id
// @access  Private/Admin
const updateTenant = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
        res.status(404);
        throw new Error('Tenant not found');
    }

    const { roomId, buildingId } = req.body;
    const oldRoomId = tenant.roomId;

    // If room is changing, update room statuses and tenantId references
    if (roomId && roomId !== oldRoomId?.toString()) {
        // Check if new room is available
        const newRoom = await Room.findById(roomId);
        if (!newRoom) {
            res.status(404);
            throw new Error('New room not found');
        }
        if (newRoom.status === 'Occupied') {
            res.status(400);
            throw new Error('New room is already occupied');
        }

        // Free up old room
        if (oldRoomId) {
            await Room.findByIdAndUpdate(oldRoomId, {
                status: 'Vacant',
                tenantId: null,
            });
        }

        // Occupy new room and set tenantId
        await Room.findByIdAndUpdate(roomId, {
            status: 'Occupied',
            tenantId: tenant._id,
        });

        // Update tenant's roomId and buildingId fields
        tenant.roomId = roomId;
        if (buildingId) {
            tenant.buildingId = buildingId;
        }
        await tenant.save();
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json(updatedTenant);
});

// @desc    Delete tenant
// @route   DELETE /api/tenants/:id
// @access  Private/Admin
const deleteTenant = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
        res.status(404);
        throw new Error('Tenant not found');
    }

    // Free up room if assigned
    if (tenant.roomId) {
        await Room.findByIdAndUpdate(tenant.roomId, {
            status: 'Vacant',
            tenantId: null,
        });
    }

    await tenant.deleteOne();

    res.status(200).json({ id: req.params.id, message: 'Tenant removed' });
});

module.exports = {
    createTenant,
    getAllTenants,
    getTenantById,
    getTenantsByBuilding,
    getTenantsByRoom,
    updateTenant,
    deleteTenant,
};
