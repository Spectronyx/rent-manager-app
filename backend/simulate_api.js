const mongoose = require('mongoose');
const Room = require('./models/roomModel');
const Building = require('./models/buildingModel');
const Payment = require('./models/paymentModel');
const Expense = require('./models/expenseModel');
const MonthlyBill = require('./models/monthlyBillModel');

require('dotenv').config();

const simulateAPI = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB\n');

        // Simulate the admin ID (first admin in the system)
        const firstBuilding = await Building.findOne({});
        if (!firstBuilding) {
            console.log('No buildings found!');
            return;
        }
        const adminId = firstBuilding.adminId;
        console.log(`Admin ID: ${adminId}\n`);

        // Get buildings for this admin
        const buildings = await Building.find({ adminId });
        const buildingIds = buildings.map(b => b._id);
        console.log(`Buildings: ${buildings.length}`);
        console.log(`Building IDs: ${buildingIds.join(', ')}\n`);

        // Get all rooms for these buildings
        const rooms = await Room.find({ buildingId: { $in: buildingIds } });
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
        const totalMonthlyRent = rooms.reduce((sum, room) => sum + (room.monthlyRent || 0), 0);

        console.log(`Total Rooms: ${totalRooms}`);
        console.log(`Occupied Rooms: ${occupiedRooms}`);
        console.log(`Total Monthly Rent: ₹${totalMonthlyRent}\n`);

        // Default to current month/year
        const targetMonth = 11;
        const targetYear = 2025;
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        console.log(`Date Range: ${startDate.toISOString()} to ${endDate.toISOString()}\n`);

        // Get payments
        const payments = await Payment.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate({
            path: 'billId',
            match: { buildingId: { $in: buildingIds } }
        });

        console.log(`=== Payments Found: ${payments.length} ===`);
        payments.forEach(p => {
            console.log(`Payment ID: ${p._id}`);
            console.log(`  Amount: ₹${p.amount}`);
            console.log(`  Status: ${p.status}`);
            console.log(`  Created: ${p.createdAt}`);
            console.log(`  Bill ID: ${p.billId ? p.billId._id : 'NULL (filtered out)'}`);
            if (p.billId) {
                console.log(`  Bill BuildingId: ${p.billId.buildingId}`);
                console.log(`  Bill matches filter: ${buildingIds.includes(p.billId.buildingId.toString())}`);
            }
            console.log('');
        });

        const totalPayments = payments.reduce((sum, p) => p.billId ? sum + p.amount : sum, 0);
        const totalCollections = totalPayments;

        console.log(`Total Payments (sum): ₹${totalPayments}`);
        console.log(`Total Collections: ₹${totalCollections}\n`);

        // Get expenses
        const expenses = await Expense.find({
            expenseDate: { $gte: startDate, $lte: endDate },
            adminId
        });
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        console.log(`=== Expenses Found: ${expenses.length} ===`);
        expenses.forEach(e => {
            console.log(`Expense: ₹${e.amount} - ${e.category} - ${e.description}`);
        });
        console.log(`Total Expenses: ₹${totalExpenses}\n`);

        // Calculate final stats
        const netProfit = totalCollections - totalExpenses;
        const totalDues = totalMonthlyRent - totalCollections;
        const collectionRate = totalMonthlyRent > 0 ? ((totalCollections / totalMonthlyRent) * 100).toFixed(2) : 0;

        console.log(`=== FINAL STATS ===`);
        console.log(`Total Collections: ₹${totalCollections}`);
        console.log(`Total Expenses: ₹${totalExpenses}`);
        console.log(`Net Profit: ₹${netProfit}`);
        console.log(`Total Dues: ₹${totalDues}`);
        console.log(`Collection Rate: ${collectionRate}%`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

simulateAPI();
