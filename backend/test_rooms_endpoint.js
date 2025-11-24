const mongoose = require('mongoose');
const Room = require('./models/roomModel');
const Building = require('./models/buildingModel');
const Tenant = require('./models/tenantModel');
const MonthlyBill = require('./models/monthlyBillModel');

require('dotenv').config();

const testRoomsEndpoint = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB\n');

        // Get first admin
        const firstBuilding = await Building.findOne({});
        const adminId = firstBuilding.adminId;
        console.log(`Admin ID: ${adminId}\n`);

        // Simulate getRoomCollections logic
        const buildings = await Building.find({ adminId });
        const buildingIds = buildings.map(b => b._id);
        console.log(`Buildings: ${buildingIds.length}\n`);

        // Get all rooms with their building info
        const rooms = await Room.find({ buildingId: { $in: buildingIds } })
            .populate('buildingId', 'name');
        console.log(`Rooms found: ${rooms.length}\n`);

        // Get tenants
        const tenants = await Tenant.find({ buildingId: { $in: buildingIds } });
        console.log(`Tenants found: ${tenants.length}\n`);

        const tenantsByRoom = {};
        tenants.forEach(t => {
            if (t.roomId) {
                tenantsByRoom[t.roomId.toString()] = t.name;
            }
        });


        const roomCollections = rooms.map(room => {
            const tenant = tenantsByRoom[room._id.toString()] || room.currentTenant || '-';

            return {
                buildingName: room.buildingId.name,
                roomNumber: room.roomNumber,
                tenant,
                monthlyRent: room.monthlyRent || 0,
                isOccupied: room.status === 'Occupied',
                status: room.status
            };
        });

        console.log('=== Room Collections ===');
        console.log(JSON.stringify(roomCollections, null, 2));

    } catch (error) {
        console.error('ERROR:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        mongoose.disconnect();
    }
};

testRoomsEndpoint();
