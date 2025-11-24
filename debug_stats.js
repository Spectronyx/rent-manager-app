const mongoose = require('mongoose');
const Room = require('./backend/models/roomModel');
const Building = require('./backend/models/buildingModel');
const Payment = require('./backend/models/paymentModel');
const Expense = require('./backend/models/expenseModel');
const User = require('./backend/models/userModel');

require('dotenv').config({ path: './backend/.env' });

const debugStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const buildings = await Building.find({});
        console.log(`Total Buildings: ${buildings.length}`);

        const rooms = await Room.find({});
        console.log(`Total Rooms: ${rooms.length}`);
        rooms.forEach(r => {
            console.log(`Room ${r.roomNumber}: Occupied=${r.isOccupied}, Rent=${r.monthlyRent}, Building=${r.buildingId}`);
        });

        const payments = await Payment.find({});
        console.log(`Total Payments: ${payments.length}`);
        payments.forEach(p => {
            console.log(`Payment: Amount=${p.amount}, Date=${p.createdAt}, BillId=${p.billId}`);
        });

        const expenses = await Expense.find({});
        console.log(`Total Expenses: ${expenses.length}`);

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

debugStats();
