const mongoose = require('mongoose');
const Room = require('./models/roomModel');
const Building = require('./models/buildingModel');
const Payment = require('./models/paymentModel');
const Expense = require('./models/expenseModel');
const User = require('./models/userModels');

require('dotenv').config();

const debugStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const buildings = await Building.find({});
        console.log(`Total Buildings: ${buildings.length}`);

        const rooms = await Room.find({});
        console.log(`Total Rooms: ${rooms.length}`);
        rooms.forEach(r => {
            console.log(`Room ${r.roomNumber}: Occupied=${r.isOccupied}, Rent=${r.monthlyRent}, Tenant=${r.currentTenant}, Building=${r.buildingId}`);
        });

        const payments = await Payment.find({});
        console.log(`Total Payments: ${payments.length}`);
        payments.forEach(p => {
            console.log(`Payment: Amount=${p.amount}, Date=${p.createdAt}, BillId=${p.billId}`);
        });

        const expenses = await Expense.find({});
        console.log(`Total Expenses: ${expenses.length}`);

        const tenants = await User.find({ role: 'tenant' });
        console.log(`Total Tenants in User collection: ${tenants.length}`);

        const TenantModel = require('./models/tenantModel');
        const tenantDocs = await TenantModel.find({});
        console.log(`Total Tenants in Tenant collection: ${tenantDocs.length}`);
        tenantDocs.forEach(t => {
            console.log(`TenantDoc: ${t.name}, RoomId: ${t.roomId}, BuildingId: ${t.buildingId}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

debugStats();
