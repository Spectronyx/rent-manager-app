const mongoose = require('mongoose');
const MonthlyBill = require('./models/monthlyBillModel');
const Room = require('./models/roomModel');

require('dotenv').config();

const fixBillBuildingIds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB\n');

        // Get all bills without buildingId
        const bills = await MonthlyBill.find({});

        console.log(`Found ${bills.length} bills to update\n`);

        for (const bill of bills) {
            // Get the room for this bill
            const room = await Room.findById(bill.roomId);

            if (!room) {
                console.log(`❌ Bill ${bill._id}: Room not found`);
                continue;
            }

            // Update the bill with the room's buildingId
            bill.buildingId = room.buildingId;
            await bill.save();

            console.log(`✅ Bill ${bill._id}: Updated buildingId to ${room.buildingId}`);
        }

        console.log(`\n✅ Updated ${bills.length} bills`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

fixBillBuildingIds();
