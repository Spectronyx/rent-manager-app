// File: backend/controllers/financialController.js

const asyncHandler = require('express-async-handler');
const Room = require('../models/roomModel');
const Building = require('../models/buildingModel');
const Payment = require('../models/paymentModel');
const Expense = require('../models/expenseModel');
const MonthlyBill = require('../models/monthlyBillModel');
const Tenant = require('../models/tenantModel');

// @desc    Get monthly statistics
// @route   GET /api/financial/monthly?month=11&year=2024
// @access  Private/Admin
// @desc    Get monthly statistics
// @route   GET /api/financial/monthly?month=11&year=2024&period=all
// @access  Private/Admin
const getMonthlyStats = asyncHandler(async (req, res) => {
    const { month, year, period } = req.query;
    const adminId = req.user._id;

    // Get buildings for this admin
    const buildings = await Building.find({ adminId });
    const buildingIds = buildings.map(b => b._id);

    // Get all rooms for these buildings
    const rooms = await Room.find({ buildingId: { $in: buildingIds } });
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
    const vacantRooms = totalRooms - occupiedRooms;

    // Calculate total monthly rent potential (current snapshot)
    const totalMonthlyRent = rooms.reduce((sum, room) => sum + (room.monthlyRent || 0), 0);

    let totalCollections = 0;
    let totalExpenses = 0;
    let targetMonth = null;
    let targetYear = null;
    // Track total payments separately for collection calculations
    let totalPayments = 0;

    if (period === 'all') {
        // Calculate ALL TIME collections (actual payments only)
        const payments = await Payment.find().populate({
            path: 'billId',
            match: { buildingId: { $in: buildingIds } }
        });
        totalPayments = payments.reduce((sum, p) => p.billId ? sum + p.amount : sum, 0);
        totalCollections = totalPayments;

        // Calculate ALL TIME expenses
        const expenses = await Expense.find({ adminId });
        totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    } else {
        // Default to current month/year if not provided
        targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
        targetYear = year ? parseInt(year) : new Date().getFullYear();

        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        // Calculate total payments for the period (actual payments only)
        const payments = await Payment.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate({
            path: 'billId',
            match: { buildingId: { $in: buildingIds } }
        });
        totalPayments = payments.reduce((sum, p) => p.billId ? sum + p.amount : sum, 0);

        // Total collections is the sum of actual payments
        totalCollections = totalPayments;

        // Calculate total expenses for the month
        const expenses = await Expense.find({
            expenseDate: { $gte: startDate, $lte: endDate },
            adminId
        });
        totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    }

    // Calculate net profit/loss
    const netProfit = totalCollections - totalExpenses;

    res.json({
        month: targetMonth,
        year: targetYear,
        period: period || 'monthly',
        totalBuildings: buildings.length,
        totalRooms,
        occupiedRooms,
        vacantRooms,
        occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0,
        totalMonthlyRent,
        totalCollections,
        totalExpenses,
        netProfit,
        // Total dues = expected rent minus what has actually been collected
        totalDues: totalMonthlyRent - totalCollections,
        collectionRate: totalMonthlyRent > 0 ? ((totalCollections / totalMonthlyRent) * 100).toFixed(2) : 0
    });
});

// @desc    Get financial data for a specific building
// @route   GET /api/financial/building/:buildingId
// @access  Private/Admin
const getBuildingFinancials = asyncHandler(async (req, res) => {
    const { buildingId } = req.params;
    const adminId = req.user._id;

    // Verify ownership
    const building = await Building.findById(buildingId);
    if (!building) {
        res.status(404);
        throw new Error('Building not found');
    }
    if (building.adminId.toString() !== adminId.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // Get rooms in this building
    const rooms = await Room.find({ buildingId });
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;

    // Get total monthly rent for this building
    const totalMonthlyRent = rooms.reduce((sum, room) => sum + (room.monthlyRent || 0), 0);

    // Get expenses for this building
    const expenses = await Expense.find({ buildingId });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Get payments (via bills)
    const bills = await MonthlyBill.find({ buildingId });
    const billIds = bills.map(b => b._id);
    const payments = await Payment.find({ billId: { $in: billIds } });
    const totalCollections = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalDues = totalMonthlyRent - totalCollections;

    res.json({
        building: {
            id: building._id,
            name: building.name,
            address: building.address
        },
        totalRooms,
        occupiedRooms,
        vacantRooms: totalRooms - occupiedRooms,
        totalMonthlyRent,
        totalCollections,
        totalExpenses,
        totalDues,
        netProfit: totalCollections - totalExpenses,
        rooms: rooms.map(r => ({
            id: r._id,
            roomNumber: r.roomNumber,
            monthlyRent: r.monthlyRent || 0,
            isOccupied: r.status === 'Occupied',
            currentTenant: r.currentTenant
        }))
    });
});

// @desc    Get per-room collection data
// @route   GET /api/financial/rooms
// @access  Private/Admin
const getRoomCollections = asyncHandler(async (req, res) => {
    const adminId = req.user._id;

    // Get all buildings for admin
    const buildings = await Building.find({ adminId });
    const buildingIds = buildings.map(b => b._id);

    // Get all rooms with their building info
    const rooms = await Room.find({ buildingId: { $in: buildingIds } })
        .populate('buildingId', 'name');

    // Get tenants
    const tenants = await Tenant.find({ buildingId: { $in: buildingIds } });
    const tenantsByRoom = {};
    tenants.forEach(t => {
        if (t.roomId) {
            tenantsByRoom[t.roomId.toString()] = t.name;
        }
    });


    const roomCollections = rooms.map(room => {
        const tenant = tenantsByRoom[room._id.toString()] || room.currentTenant || '-';

        return {
            buildingName: room.buildingId.name,
            roomNumber: room.roomNumber,
            tenant,
            monthlyRent: room.monthlyRent || 0,
            isOccupied: room.status === 'Occupied',
            status: room.status
        };
    });

    res.json(roomCollections);
});

module.exports = {
    getMonthlyStats,
    getBuildingFinancials,
    getRoomCollections
};
