// File: backend/controllers/paymentController.js

const asyncHandler = require('express-async-handler');
const Payment = require('../models/paymentModel.js');
const MonthlyBill = require('../models/monthlyBillModel.js');
const Building = require('../models/buildingModel.js');
const Room = require('../models/roomModel.js');

// @desc    Confirm a payment (by admin)
// @route   POST /api/payments/confirm/:billId
// @access  Private/Admin
const confirmPayment = asyncHandler(async (req, res) => {
    const {
        billId
    } = req.params;
    const {
        amount,
        paymentMethod
    } = req.body;

    const bill = await MonthlyBill.findById(billId);

    if (!bill) {
        res.status(404);
        throw new Error('Bill not found');
    }

    // TODO: Add check to ensure admin owns the building this bill belongs to

    // 1. Check if bill is ready for confirmation
    if (bill.status !== 'PaymentPendingConfirmation') {
        res.status(400);
        throw new Error(`Bill is not awaiting confirmation. Status: ${bill.status}`);
    }

    // 2. Create the "Receipt" (Payment document)
    const payment = await Payment.create({
        billId: bill._id,
        tenantId: bill.tenantId,
        amount: amount || bill.totalAmount, // Use amount from body, or default to full bill
        paymentMethod: paymentMethod || 'UPI',
        status: 'Confirmed',
    });

    // 3. Update the Bill's status to "Paid"
    bill.status = 'Paid';
    await bill.save();

    // 4. Send back the new Payment "receipt"
    res.status(201).json({
        message: 'Payment confirmed and bill marked as Paid.',
        payment,
    });
});

// @desc    Get all payment records for a building (for admin)
// @route   GET /api/payments/building/:buildingId
// @access  Private/Admin
const getPaymentsForBuilding = asyncHandler(async (req, res) => {
    const {
        buildingId
    } = req.params;
    // TODO: Check admin ownership

    // Find all rooms in the building
    const rooms = await Room.find({
        buildingId
    }).select('_id');
    const roomIds = rooms.map(room => room._id);

    // Find all bills for those rooms
    const bills = await MonthlyBill.find({
        roomId: {
            $in: roomIds
        }
    }).select('_id');
    const billIds = bills.map(bill => bill._id);

    // Find all payments for those bills
    const payments = await Payment.find({
            billId: {
                $in: billIds
            }
        })
        .populate('tenantId', 'name')
        .populate('billId', 'month year totalAmount');

    res.json(payments);
});

// @desc    Get logged-in student's payment history
// @route   GET /api/payments/my
// @access  Private
const getMyPayments = asyncHandler(async (req, res) => {
    // We only find payments where the tenantId matches the logged-in user
    const payments = await Payment.find({
            tenantId: req.user._id
        })
        .sort({
            paymentDate: -1
        }) // Show most recent first
        .populate({
            path: 'billId',
            select: 'month year', // Also grab the bill's month/year
        });
    res.json(payments);
});
// @desc    Get all confirmed payments for all of admin's buildings
// @route   GET /api/payments/admin/all
// @access  Private/Admin
const getAdminPaymentHistory = asyncHandler(async (req, res) => {
    // 1. Find all buildings for this admin
    const buildings = await Building.find({
        adminId: req.user._id
    }).select('_id');
    const buildingIds = buildings.map((b) => b._id);

    // 2. Find all rooms in those buildings
    const rooms = await Room.find({
        buildingId: {
            $in: buildingIds
        }
    }).select('_id');
    const roomIds = rooms.map((r) => r._id);

    // 3. Find all bills for those rooms
    const bills = await MonthlyBill.find({
        roomId: {
            $in: roomIds
        }
    }).select('_id');
    const billIds = bills.map((b) => b._id);

    // 4. Find all *confirmed* payments for those bills
    const payments = await Payment.find({
            billId: {
                $in: billIds
            },
            status: 'Confirmed',
        })
        .sort({
            paymentDate: -1
        }) // Show most recent first
        .populate('tenantId', 'name') // Get the tenant's name
        .populate({
            // Start nested populate
            path: 'billId',
            select: 'month year', // From the bill, get month/year
            populate: {
                path: 'roomId',
                select: 'roomNumber', // From the room, get the room number
                populate: {
                    path: 'buildingId',
                    select: 'name', // From the building, get the name
                },
            },
        });

    res.json(payments);
});

module.exports = {
    confirmPayment,
    getPaymentsForBuilding,
    getMyPayments,
    getAdminPaymentHistory,
};