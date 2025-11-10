// File: backend/config/db.js

const mongoose = require('mongoose');

// We're creating an asynchronous function to connect
const connectDB = async () => {
    try {
        // We try to connect using the URI from our .env file
        const conn = await mongoose.connect(process.env.MONGO_URI);

        // If successful, we log the host
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // If it fails, we log the error and stop the server
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit with failure
    }
};

// We export the function to be used in server.js
module.exports = connectDB;