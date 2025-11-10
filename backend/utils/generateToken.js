// File: backend/utils/generateToken.js

const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    // jwt.sign() creates the token
    // It takes a payload (what to store), a secret, and options
    return jwt.sign({
        id,
        role
    }, process.env.JWT_SECRET, {
        expiresIn: '30d', // The token will be valid for 30 days
    });
};

module.exports = generateToken;