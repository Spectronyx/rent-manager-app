// File: backend/routes/userRoutes.js
const {
    body,
    validationResult
} = require('express-validator');
const express = require('express');
const router = express.Router();
// 1. Import getStudents
const {
    registerUser,
    loginUser,
    getStudents,
    createAdminUser
} = require('../controllers/userController.js');
// 2. Import our middleware
const {
    protect,
    admin
} = require('../middlewares/authMiddleware.js');
const registerValidationRules = [
    // name: must not be empty, then trim whitespace and escape special chars
    body('name', 'Name is required').notEmpty().trim().escape(),

    // email: must be a valid email, then normalize it (e.g., 'Test@GMAIL.com' -> 'test@gmail.com')
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),

    // phone: must not be empty
    body('phone', 'Phone number is required').notEmpty().trim(),

    // password: must be at least 6 characters long
    body('password', 'Password must be at least 6 characters').isLength({
        min: 6
    }),
];

// 3. Create a small middleware to check the results of the rules
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); // No errors? Continue to the next middleware (the controller)
    }
    // If there are errors, stop here and send a 400 response
    return res.status(400).json({
        errors: errors.array()
    });
};
// Public routes
router.post('/', registerUser); // This is still /api/users
router.post('/login', loginUser);

// --- 3. Add our new Admin route ---
// This will be GET /api/users
router.route('/').get(protect, admin, getStudents);
router.post('/admin', protect, admin, createAdminUser); // 2. Add new route

module.exports = router;