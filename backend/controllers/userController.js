// File: backend/controllers/userController.js

const asyncHandler = require('express-async-handler');
const User = require('../models/userModels.js');
const generateToken = require('../utils/generateToken.js');
// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    // 1. Get data from the request body
    const {
        name,
        email,
        password,
        phone,
    } = req.body;

    // 2. Check if user already exists
    const userExists = await User.findOne({
        email
    });

    if (userExists) {
        res.status(400); // 400 = Bad Request
        throw new Error('User already exists');
    }

    // 3. Create the new user in the database
    // Our 'pre-save' hook in the model will automatically hash the password
    const user = await User.create({
        name,
        email,
        password,
        phone,
        role : "student", // Note: You might want to force 'student' role here for public registration
        // and have a separate 'createAdmin' function.
    });

    // 4. If user was created successfully...
    if (user) {
        // 5. Send back the user's data (minus the password) and a token
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const createAdminUser = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        phone
    } = req.body;

    const userExists = await User.findOne({
        email
    });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        phone,
        role: 'admin', // <-- This is the key difference
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            // We don't send a token, just confirmation
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => { // 1. REMOVE asyncHandler, add 'next'
    try {
        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({
            email
        });

        if (user && (await user.matchPassword(password))) {
            // Manually send the JSON response
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401);
            // Manually throw the error
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        // 2. THIS IS THE CRITICAL PART
        // If *anything* above fails, this 'catch' block will
        // run and *force* a response, stopping the 'pending' hang.
        console.error('LOGIN FAILED IN CATCH BLOCK:', error);
        next(error); // 3. Pass the error to our main errorHandler
    }
};
const getStudents = asyncHandler(async (req, res) => {
    // Find all users where the role is 'student'
    // We only select the 'id' and 'name' to send to the frontend
    const students = await User.find({
        role: 'student'
    }).select('_id name');
    res.json(students);
});

module.exports = {
    registerUser,
    loginUser,
    getStudents,
    createAdminUser
};