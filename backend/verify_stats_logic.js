const mongoose = require('mongoose');
const Room = require('./models/roomModel');
const Building = require('./models/buildingModel');

require('dotenv').config();

const verifyStatsLogic = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const buildings = await Building.find({});
        const buildingIds = buildings.map(b => b._id);

        const rooms = await Room.find({ buildingId: { $in: buildingIds } });
        const totalRooms = rooms.length;

        // This mimics the FIXED logic
        const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;

        const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0;

        console.log(`Total Rooms: ${totalRooms}`);
        console.log(`Occupied Rooms (status='Occupied'): ${occupiedRooms}`);
        console.log(`Occupancy Rate: ${occupancyRate}%`);

        rooms.forEach(r => {
            console.log(`Room ${r.roomNumber}: status=${r.status}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

verifyStatsLogic();
