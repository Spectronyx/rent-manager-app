// File: backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModels');

// --- The "Logged-in" Bouncer ---
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Check if the request has a "Bearer" token in the Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 2. Get the token part from the header
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify the token using our secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find the user in the database (minus their password)
            //    and attach them to the request object
            req.user = await User.findById(decoded.id).select('-password');

            // 5. Let the request pass through to the controller
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// --- The "Admin" Bouncer ---
// This middleware MUST be used *after* the 'protect' middleware
const admin = (req, res, next) => {
    // 'req.user' was added by the 'protect' middleware
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, let them pass
    } else {
        res.status(401); // 401 = Unauthorized
        throw new Error('Not authorized as an admin');
    }
};

module.exports = {
    protect,
    admin
};