const mongoose = require('mongoose');
const Room = require('./models/roomModel');
const Tenant = require('./models/tenantModel');

require('dotenv').config();

const fixData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Fix Room 101 & Rajneesh
        const room101 = await Room.findOne({ roomNumber: '101' });
        const tenantRajneesh = await Tenant.findOne({ name: 'Rajneesh Sharma' });

        if (room101 && tenantRajneesh) {
            console.log('Fixing Room 101 and Tenant Rajneesh...');

            // Update Room
            room101.isOccupied = true;
            room101.currentTenant = tenantRajneesh.name;
            await room101.save();
            console.log('Room 101 updated.');

            // Update Tenant
            tenantRajneesh.roomId = room101._id;
            await tenantRajneesh.save();
            console.log('Tenant Rajneesh updated.');
        }

        // Fix Room 104 & Ysh
        const room104 = await Room.findOne({ roomNumber: '104' });
        const tenantYsh = await Tenant.findOne({ name: 'Ysh' });

        if (room104 && tenantYsh) {
            console.log('Fixing Room 104 and Tenant Ysh...');

            // Update Room
            room104.isOccupied = true;
            room104.currentTenant = tenantYsh.name;
            await room104.save();
            console.log('Room 104 updated.');

            // Update Tenant
            tenantYsh.roomId = room104._id;
            await tenantYsh.save();
            console.log('Tenant Ysh updated.');
        }

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

fixData();
