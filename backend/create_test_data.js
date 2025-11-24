const mongoose = require('mongoose');
const Room = require('./models/roomModel');
const Building = require('./models/buildingModel');
const Tenant = require('./models/tenantModel');
const MonthlyBill = require('./models/monthlyBillModel');
const Payment = require('./models/paymentModel');

require('dotenv').config();

const createTestData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB\n');

        // Get all buildings
        const buildings = await Building.find({});

        for (const building of buildings) {
            console.log(`Processing ${building.name}...`);

            // Get all occupied rooms in this building
            const rooms = await Room.find({
                buildingId: building._id,
                status: 'Occupied'
            });

            console.log(`  Found ${rooms.length} occupied rooms`);

            for (const room of rooms) {
                // Check if bill already exists for current month
                const currentMonth = 11;
                const currentYear = 2025;

                const existingBill = await MonthlyBill.findOne({
                    roomId: room._id,
                    month: currentMonth,
                    year: currentYear
                });

                if (existingBill) {
                    console.log(`  ✓ Bill already exists for Room ${room.roomNumber}`);

                    // Check if payment exists
                    const existingPayment = await Payment.findOne({ billId: existingBill._id });
                    if (!existingPayment && room.tenantId) {
                        console.log(`  → Creating payment for Room ${room.roomNumber}`);
                        const payment = await Payment.create({
                            billId: existingBill._id,
                            tenantId: room.tenantId,
                            amount: existingBill.totalAmount,
                            paymentMethod: 'UPI',
                            status: 'Confirmed'
                        });

                        // Mark bill as paid
                        existingBill.status = 'Paid';
                        await existingBill.save();

                        console.log(`  ✓ Payment created: ₹${payment.amount}`);
                    } else if (existingPayment) {
                        console.log(`  ✓ Payment already exists for Room ${room.roomNumber}`);
                    }
                    continue;
                }

                if (!room.tenantId) {
                    console.log(`  ✗ Room ${room.roomNumber} has no tenantId`);
                    continue;
                }

                // Create bill
                console.log(`  → Creating bill for Room ${room.roomNumber}`);
                const bill = await MonthlyBill.create({
                    roomId: room._id,
                    tenantId: room.tenantId,
                    buildingId: building._id,
                    month: currentMonth,
                    year: currentYear,
                    rent: room.monthlyRent,
                    electricityBill: 0,
                    otherCharges: 0,
                    previousDues: 0,
                    totalAmount: room.monthlyRent,
                    status: 'Paid'
                });
                console.log(`  ✓ Bill created: ₹${bill.totalAmount}`);

                // Create payment
                console.log(`  → Creating payment for Room ${room.roomNumber}`);
                const payment = await Payment.create({
                    billId: bill._id,
                    tenantId: room.tenantId,
                    amount: bill.totalAmount,
                    paymentMethod: 'UPI',
                    status: 'Confirmed'
                });
                console.log(`  ✓ Payment created: ₹${payment.amount}`);
            }
        }

        // Summary
        const totalBills = await MonthlyBill.countDocuments({});
        const totalPayments = await Payment.countDocuments({});
        const totalAmount = await Payment.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        console.log(`\n=== Summary ===`);
        console.log(`Total Bills: ${totalBills}`);
        console.log(`Total Payments: ${totalPayments}`);
        console.log(`Total Amount Collected: ₹${totalAmount[0]?.total || 0}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

createTestData();
