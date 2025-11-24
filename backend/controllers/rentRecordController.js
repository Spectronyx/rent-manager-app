// File: backend/controllers/rentRecordController.js

const asyncHandler = require('express-async-handler');
const RentRecord = require('../models/rentRecordModel');
const Tenant = require('../models/tenantModel');
const Room = require('../models/roomModel');
const Building = require('../models/buildingModel');

// @desc    Get all rent records for admin
// @route   GET /api/rent-records
// @access  Private/Admin
const getAllRentRecords = asyncHandler(async (req, res) => {
    const { month, year, buildingId, isPaid } = req.query;

    const filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (buildingId) filter.buildingId = buildingId;
    if (isPaid !== undefined) filter.isPaid = isPaid === 'true';

    const records = await RentRecord.find(filter)
        .populate('tenantId', 'name email phone')
        .populate('roomId', 'roomNumber')
        .populate('buildingId', 'name')
        .sort('-year -month');

    res.json(records);
});

// @desc    Get rent records for a specific tenant
// @route   GET /api/rent-records/tenant/:tenantId
// @access  Private/Admin
const getTenantRentRecords = asyncHandler(async (req, res) => {
    const records = await RentRecord.find({ tenantId: req.params.tenantId })
        .populate('roomId', 'roomNumber')
        .populate('buildingId', 'name')
        .sort('-year -month');

    res.json(records);
});

// @desc    Create rent record (usually done automatically)
// @route   POST /api/rent-records
// @access  Private/Admin
const createRentRecord = asyncHandler(async (req, res) => {
    const { tenantId, roomId, buildingId, month, year, amount, dueDate } = req.body;

    // Check if record already exists
    const existingRecord = await RentRecord.findOne({ tenantId, month, year });
    if (existingRecord) {
        res.status(400);
        throw new Error('Rent record for this month already exists');
    }

    const record = await RentRecord.create({
        tenantId,
        roomId,
        buildingId,
        month,
        year,
        amount,
        dueDate,
        isPaid: false,
    });

    res.status(201).json(record);
});

// @desc    Mark rent as paid/unpaid
// @route   PUT /api/rent-records/:id/payment
// @access  Private/Admin
const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { isPaid, notes } = req.body;

    const record = await RentRecord.findById(req.params.id);

    if (!record) {
        res.status(404);
        throw new Error('Rent record not found');
    }

    record.isPaid = isPaid;
    record.paidDate = isPaid ? new Date() : null;
    if (notes) record.notes = notes;

    const updatedRecord = await record.save();

    res.json(updatedRecord);
});

// @desc    Generate rent records (bills) for current month with electricity
// @route   POST /api/rent-records/generate
// @access  Private/Admin
const generateMonthlyRecords = asyncHandler(async (req, res) => {
    const { month, year, buildingId, electricityRatePerUnit, roomElectricity } = req.body;

    // Build filter for tenants
    const tenantFilter = {
        status: 'active',
        roomId: { $ne: null }
    };
    if (buildingId) {
        tenantFilter.buildingId = buildingId;
    }

    // Get all active tenants with assigned rooms
    const tenants = await Tenant.find(tenantFilter)
        .populate('roomId')
        .populate('buildingId');

    const records = [];
    const errors = [];

    for (const tenant of tenants) {
        try {
            // Check if record already exists
            const existing = await RentRecord.findOne({
                tenantId: tenant._id,
                month,
                year
            });

            if (!existing) {
                // Get electricity units for this room (from roomElectricity object)
                const roomKey = tenant.roomId._id.toString();
                const electricityUnits = roomElectricity?.[roomKey] || 0;
                const electricityBill = electricityUnits * (electricityRatePerUnit || 0);
                const rentAmount = tenant.roomId.monthlyRent;
                const totalAmount = rentAmount + electricityBill;

                // Create due date (5th of the month)
                const dueDate = new Date(year, month - 1, 5);

                const record = await RentRecord.create({
                    tenantId: tenant._id,
                    roomId: tenant.roomId._id,
                    buildingId: tenant.buildingId._id,
                    month,
                    year,
                    amount: rentAmount,
                    electricityUnits,
                    electricityBill,
                    totalAmount,
                    dueDate,
                    isPaid: false,
                });

                records.push(record);
            }
        } catch (error) {
            errors.push({
                tenant: tenant.name,
                error: error.message
            });
        }
    }

    res.json({
        success: true,
        recordsCreated: records.length,
        records,
        errors: errors.length > 0 ? errors : undefined
    });
});

// @desc    Generate bill for a specific room
// @route   POST /api/rent-records/generate/room
// @access  Private/Admin
const generateRoomBill = asyncHandler(async (req, res) => {
    const { roomId, month, year, electricityUnits, electricityRatePerUnit } = req.body;

    // Find tenant in this room
    const tenant = await Tenant.findOne({ roomId, status: 'active' })
        .populate('roomId')
        .populate('buildingId');

    if (!tenant) {
        res.status(404);
        throw new Error('No active tenant found in this room');
    }

    // Check if record already exists
    const existing = await RentRecord.findOne({
        tenantId: tenant._id,
        month,
        year
    });

    if (existing) {
        res.status(400);
        throw new Error('Bill for this month already exists');
    }

    const electricityBill = (electricityUnits || 0) * (electricityRatePerUnit || 0);
    const rentAmount = tenant.roomId.monthlyRent;
    const totalAmount = rentAmount + electricityBill;
    const dueDate = new Date(year, month - 1, 5);

    const record = await RentRecord.create({
        tenantId: tenant._id,
        roomId: tenant.roomId._id,
        buildingId: tenant.buildingId._id,
        month,
        year,
        amount: rentAmount,
        electricityUnits: electricityUnits || 0,
        electricityBill,
        totalAmount,
        dueDate,
        isPaid: false,
    });

    res.status(201).json(record);
});

// @desc    Mark bill as paid
// @route   PUT /api/rent-records/:id/pay
// @access  Private/Admin
const markBillAsPaid = asyncHandler(async (req, res) => {
    const { paymentMethod, paidDate, notes } = req.body;

    const record = await RentRecord.findById(req.params.id);

    if (!record) {
        res.status(404);
        throw new Error('Bill not found');
    }

    if (record.isPaid) {
        res.status(400);
        throw new Error('Bill is already marked as paid');
    }

    record.isPaid = true;
    record.paidDate = paidDate || new Date();
    record.paymentMethod = paymentMethod;
    if (notes) record.notes = notes;

    const updatedRecord = await record.save();

    // Populate before sending response
    await updatedRecord.populate('tenantId', 'name email phone');
    await updatedRecord.populate('roomId', 'roomNumber');
    await updatedRecord.populate('buildingId', 'name');

    res.json(updatedRecord);
});

// @desc    Get all pending (unpaid) bills
// @route   GET /api/rent-records/pending
// @access  Private/Admin
const getPendingBills = asyncHandler(async (req, res) => {
    const { buildingId } = req.query;

    const filter = { isPaid: false };
    if (buildingId) filter.buildingId = buildingId;

    const bills = await RentRecord.find(filter)
        .populate('tenantId', 'name email phone collegeId')
        .populate('roomId', 'roomNumber')
        .populate('buildingId', 'name')
        .sort('dueDate');

    res.json(bills);
});

// @desc    Get bills for a specific month
// @route   GET /api/rent-records/month/:year/:month
// @access  Private/Admin
const getBillsForMonth = asyncHandler(async (req, res) => {
    const { year, month } = req.params;
    const { buildingId } = req.query;

    const filter = {
        year: parseInt(year),
        month: parseInt(month)
    };
    if (buildingId) filter.buildingId = buildingId;

    const bills = await RentRecord.find(filter)
        .populate('tenantId', 'name email phone collegeId')
        .populate('roomId', 'roomNumber')
        .populate('buildingId', 'name')
        .sort('buildingId roomId');

    res.json(bills);
});

// @desc    Delete rent record
// @route   DELETE /api/rent-records/:id
// @access  Private/Admin
const deleteRentRecord = asyncHandler(async (req, res) => {
    const record = await RentRecord.findById(req.params.id);

    if (!record) {
        res.status(404);
        throw new Error('Rent record not found');
    }

    await record.deleteOne();
    res.json({ message: 'Rent record deleted', id: req.params.id });
});

module.exports = {
    getAllRentRecords,
    getTenantRentRecords,
    createRentRecord,
    updatePaymentStatus,
    generateMonthlyRecords,
    generateRoomBill,
    markBillAsPaid,
    getPendingBills,
    getBillsForMonth,
    deleteRentRecord,
};
