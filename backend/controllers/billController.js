// File: backend/controllers/billController.js

const asyncHandler = require('express-async-handler');
const MonthlyBill = require('../models/monthlyBillModel.js');
const Room = require('../models/roomModel.js');
const Building = require('../models/buildingModel.js');

// @desc    Generate bills for all occupied rooms in a building
// @route   POST /api/bills/generate/:buildingId
// @access  Private/Admin
const generateBills = asyncHandler(async (req, res) => {
    const {
        buildingId
    } = req.params;
    const {
        month,
        year
    } = req.body; // e.g., month: 11, year: 2025

    if (!month || !year) {
        res.status(400);
        throw new Error('Please provide month and year');
    }

    // 1. Check if admin owns this building
    const building = await Building.findById(buildingId);
    if (!building || building.adminId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized for this building');
    }

    // 2. Find all "Occupied" rooms in this building
    const occupiedRooms = await Room.find({
        buildingId: buildingId,
        status: 'Occupied',
    });

    if (occupiedRooms.length === 0) {
        return res.json({
            message: 'No occupied rooms found to bill'
        });
    }

    let billsGenerated = 0;
    let billsSkipped = 0;

    // 3. Loop through each room and create a bill
    for (const room of occupiedRooms) {
        // 3a. Check if a bill for this month/year/room already exists
        const billExists = await MonthlyBill.findOne({
            roomId: room._id,
            month: month,
            year: year,
        });

        if (billExists) {
            billsSkipped++;
            continue; // Skip if bill already exists
        }

        // 3b. Find previous month's bill to check for dues
        let previousDues = 0;
        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;

        const lastBill = await MonthlyBill.findOne({
            roomId: room._id,
            month: lastMonth,
            year: lastYear,
        });

        if (lastBill && lastBill.status !== 'Paid') {
            // Logic for dues: if it's not paid, the total amount is due
            // A more complex system might check 'amountPaid' vs 'totalAmount'
            previousDues = lastBill.totalAmount;
        }

        // 3c. Create the new bill
        const totalAmount = room.monthlyRent + previousDues; // Initial total
        await MonthlyBill.create({
            roomId: room._id,
            tenantId: room.tenantId,
            buildingId: buildingId,
            month: month,
            year: year,
            rent: room.monthlyRent,
            previousDues: previousDues,
            totalAmount: totalAmount, // Will be updated later with elec/other
            status: 'Pending',
        });
        billsGenerated++;
    }

    res.status(201).json({
        message: `Bill generation complete: ${billsGenerated} created, ${billsSkipped} skipped.`,
    });
});

// @desc    Update a bill with extra charges
// @route   PUT /api/bills/:billId/charges
// @access  Private/Admin
const updateBillCharges = asyncHandler(async (req, res) => {
    const {
        electricityBill,
        otherCharges
    } = req.body;
    const bill = await MonthlyBill.findById(req.params.billId);

    if (!bill) {
        res.status(404);
        throw new Error('Bill not found');
    }

    // TODO: Add check to ensure admin owns the building this bill belongs to

    bill.electricityBill = electricityBill || bill.electricityBill;
    bill.otherCharges = otherCharges || bill.otherCharges;

    // Recalculate total
    bill.totalAmount =
        bill.rent +
        bill.electricityBill +
        bill.otherCharges +
        bill.previousDues;

    const updatedBill = await bill.save();
    res.json(updatedBill);
});


// @desc    Get the current bill for the logged-in student
// @route   GET /api/bills/mybill
// @access  Private
const getMyCurrentBill = asyncHandler(async (req, res) => {
    // Only students can access this
    if (req.user.role !== 'student') {
        res.status(403); // Forbidden
        throw new Error('Only students can access this route');
    }

    // Find the *latest* pending bill for this tenant
    const bill = await MonthlyBill.findOne({
        tenantId: req.user._id,
        status: {
            $in: ['Pending', 'PaymentPendingConfirmation', 'Overdue']
        },
    })
        .sort({
            year: -1,
            month: -1
        }) // Get the most recent one
        .populate('roomId', 'roomNumber');

    if (bill) {
        res.json(bill);
    } else {
        res.status(404);
        throw new Error('No outstanding bill found');
    }
});

// @desc    Mark a bill as "paid" by the student
// @route   PUT /api/bills/:billId/markpaid
// @access  Private
const markBillAsPaidByStudent = asyncHandler(async (req, res) => {
    const bill = await MonthlyBill.findById(req.params.billId);

    // Check if bill exists and belongs to the logged-in student
    if (!bill || bill.tenantId.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Bill not found or does not belong to user');
    }

    if (bill.status === 'Pending' || bill.status === 'Overdue') {
        bill.status = 'PaymentPendingConfirmation';
        const updatedBill = await bill.save();
        res.json({
            message: 'Payment marked for confirmation. Admin will verify shortly.',
            bill: updatedBill,
        });
    } else {
        res.status(400);
        throw new Error(`Cannot mark bill with status: ${bill.status}`);
    }
});



// @desc    Get all bills awaiting payment confirmation
// @route   GET /api/bills/pending
// @access  Private/Admin
const getPendingBills = asyncHandler(async (req, res) => {
    // 1. Find all buildings this admin owns
    const adminBuildings = await Building.find({
        adminId: req.user._id
    }).select(
        '_id'
    );
    const buildingIds = adminBuildings.map((b) => b._id);

    // 2. Find all rooms in those buildings
    const roomsInAdminBuildings = await Room.find({
        buildingId: {
            $in: buildingIds
        },
    }).select('_id');
    const roomIds = roomsInAdminBuildings.map((r) => r._id);

    // 3. Find all bills for those rooms that are pending
    const pendingBills = await MonthlyBill.find({
        roomId: {
            $in: roomIds
        },
        status: 'PaymentPendingConfirmation',
    })
        .populate('tenantId', 'name')
        .populate('roomId', 'roomNumber');

    res.json(pendingBills);
});

// @desc    Get all bills for a building (for admin)
// @route   GET /api/bills/building/:buildingId
// @access  Private/Admin
const getBillsForBuilding = asyncHandler(async (req, res) => {
    const {
        buildingId
    } = req.params;
    const {
        status
    } = req.query; // <-- 1. Get the 'status' from the query

    // TODO: Add check to ensure admin owns this building

    // 2. Create our filter object
    let filter = {
        roomId: {
            $in: await Room.find({
                buildingId
            }).select('_id'),
        },
    };

    // 3. If a status is provided, add it to the filter
    if (status) {
        filter.status = status;
    }

    // 4. Use the filter to find the bills
    const bills = await MonthlyBill.find(filter)
        .populate('tenantId', 'name email')
        .populate('roomId', 'roomNumber');

    res.json(bills);
});

module.exports = {
    generateBills,
    updateBillCharges,
    getBillsForBuilding,
    getMyCurrentBill,
    markBillAsPaidByStudent,
    getPendingBills
};