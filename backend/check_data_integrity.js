const mongoose = require('mongoose');
const Room = require('./models/roomModel');
const Building = require('./models/buildingModel');
const Tenant = require('./models/tenantModel');

require('dotenv').config();

const checkDataIntegrity = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const buildings = await Building.find({});
        console.log(`\n=== Buildings ===`);
        for (const building of buildings) {
            console.log(`\nBuilding: ${building.name}`);
            console.log(`  ID: ${building._id}`);
            console.log(`  AdminId: ${building.adminId}`);

            const rooms = await Room.find({ buildingId: building._id });
            console.log(`  Rooms (${rooms.length}):`);
            rooms.forEach(r => {
                console.log(`    - Room ${r.roomNumber}: Status=${r.status}, Rent=₹${r.monthlyRent}, TenantId=${r.tenantId}`);
            });

            const tenants = await Tenant.find({ buildingId: building._id });
            console.log(`  Tenants (${tenants.length}):`);
            tenants.forEach(t => {
                console.log(`    - ${t.name}: RoomId=${t.roomId}, BuildingId=${t.buildingId}`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

checkDataIntegrity();
