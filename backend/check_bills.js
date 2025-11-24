const mongoose = require('mongoose');
const MonthlyBill = require('./models/monthlyBillModel');
const Building = require('./models/buildingModel');
const Room = require('./models/roomModel');

require('dotenv').config();

const checkBills = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB\n');

        const bills = await MonthlyBill.find({})
            .populate('roomId')
            .populate('buildingId');

        console.log(`=== Bills (${bills.length}) ===\n`);

        for (const bill of bills) {
            console.log(`Bill ID: ${bill._id}`);
            console.log(`  Room: ${bill.roomId?.roomNumber || 'NULL'}`);
            console.log(`  Room's BuildingId: ${bill.roomId?.buildingId}`);
            console.log(`  Bill's BuildingId: ${bill.buildingId || 'NULL'}`);
            console.log(`  Match: ${bill.buildingId?.toString() === bill.roomId?.buildingId?.toString()}`);
            console.log(`  Amount: ₹${bill.totalAmount}`);
            console.log(`  Status: ${bill.status}`);
            console.log('');
        }

        // Check what buildingIds actually exist
        const buildings = await Building.find({});
        console.log(`\n=== Buildings ===`);
        buildings.forEach(b => {
            console.log(`${b.name}: ${b._id}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

checkBills();
