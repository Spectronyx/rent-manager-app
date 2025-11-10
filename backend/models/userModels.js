// File: backend/models/userModel.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Define the User Schema (the blueprint)
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true, // Ensures no two users can have the same email
        trim: true, // Removes whitespace
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6, // Enforces a minimum password length
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'admin'], // The role must be one of these
        default: 'student', // Default role is 'student'
    },
}, {
    // Adds 'createdAt' and 'updatedAt' timestamps automatically
    timestamps: true,
});

// 2. Add the "Pre-Save Hook" (Mongoose Middleware)
// This function will run *before* a new user is saved to the database
userSchema.pre('save', async function (next) {
    // 'this' refers to the user document being saved

    // Only hash the password if it's being modified (or is new)
    if (!this.isModified('password')) {
        return next(); // If password isn't changed, move on
    }

    // Generate the "salt" - a random string to make the hash unique
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the salt
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Continue with the save operation
});

// 2b. Add a method to the schema to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    // 'this.password' is the hashed password in the database
    return await bcrypt.compare(enteredPassword, this.password);
};



// 3. Create and export the Model
// We're telling Mongoose: "Create a model named 'User' using the userSchema"
const User = mongoose.model('User', userSchema);

module.exports = User;