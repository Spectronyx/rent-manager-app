const mongoose = require('mongoose');
const Payment = require('./models/paymentModel');
const MonthlyBill = require('./models/monthlyBillModel');
const Room = require('./models/roomModel');
const Building = require('./models/buildingModel');

require('dotenv').config();

const debugPayments = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Check payments
        const payments = await Payment.find({})
            .populate('billId')
            .populate('tenantId', 'name');
        console.log(`\n--- Payments (${payments.length}) ---`);
        payments.forEach(p => {
            console.log(`Payment: Amount=₹${p.amount}, Status=${p.status}, TenantId=${p.tenantId?._id}, BillId=${p.billId?._id}, Date=${p.createdAt}`);
        });

        // Check bills
        const bills = await MonthlyBill.find({})
            .populate('roomId', 'roomNumber')
            .populate('tenantId', 'name');
        console.log(`\n--- Bills (${bills.length}) ---`);
        bills.forEach(b => {
            console.log(`Bill: Room=${b.roomId?.roomNumber}, Tenant=${b.tenantId?.name}, Amount=₹${b.totalAmount}, Status=${b.status}, Month=${b.month}/${b.year}`);
        });

        // Check buildings
        const buildings = await Building.find({});
        console.log(`\n--- Buildings (${buildings.length}) ---`);
        buildings.forEach(b => {
            console.log(`Building: ${b.name}, ID=${b._id}`);
        });

        // Check rooms
        const rooms = await Room.find({})
            .populate('buildingId', 'name');
        console.log(`\n--- Rooms (${rooms.length}) ---`);
        rooms.forEach(r => {
            console.log(`Room: ${r.roomNumber}, Building=${r.buildingId?.name}, Status=${r.status}, Rent=₹${r.monthlyRent}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

debugPayments();
