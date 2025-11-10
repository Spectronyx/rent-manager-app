// File: backend/middleware/errorMiddleware.js

// Handles 404 Not Found errors
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// The "Catch-All" Error Handler
// By having 4 parameters (err, req, res, next), Express knows
// this is an error-handling middleware.
const errorHandler = (err, req, res, next) => {
    // Sometimes an error might come in with a 200 (OK) status.
    // We'll set it to 500 (Internal Server Error) if it's not already an error status.
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Handle specific Mongoose bad ObjectId error
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }

    res.status(statusCode).json({
        message: message,
        // We only want to see the 'stack' trace if we're not in production
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    notFound,
    errorHandler
};