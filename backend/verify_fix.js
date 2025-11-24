const mongoose = require('mongoose');
const Room = require('./models/roomModel');
const Building = require('./models/buildingModel');
const Payment = require('./models/paymentModel');
const MonthlyBill = require('./models/monthlyBillModel');

require('dotenv').config();

const verifyFix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Check Rooms
        const rooms = await Room.find({});
        console.log(`\n--- Rooms (${rooms.length}) ---`);
        rooms.forEach(r => {
            console.log(`Room ${r.roomNumber}: isOccupied=${r.isOccupied}, Tenant=${r.currentTenant}, Rent=${r.monthlyRent}, BuildingId=${r.buildingId}`);
        });

        // 2. Check Bills
        const bills = await MonthlyBill.find({});
        console.log(`\n--- Bills (${bills.length}) ---`);
        bills.forEach(b => {
            console.log(`Bill for Room ${b.roomId}: Amount=${b.totalAmount}, isPaid=${b.isPaid}`);
        });

        // 3. Check Payments
        const payments = await Payment.find({});
        console.log(`\n--- Payments (${payments.length}) ---`);
        payments.forEach(p => {
            console.log(`Payment: Amount=${p.amount}, BillId=${p.billId}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

verifyFix();
