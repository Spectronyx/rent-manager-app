// File: backend/server.js

// 1. Import our core packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // <-- Moved import to top
const rateLimit = require('express-rate-limit'); // <-- 1. Import rate-limit
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoutes.js');
const buildingRoutes = require('./routes/buildingRoutes.js');
const roomRoutes = require('./routes/roomRoutes.js');
const billRoutes = require('./routes/billRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const documentRoutes = require('./routes/documentRoutes.js');
const expenseRoutes = require('./routes/expenseRoute.js'); // <-- 2. Fixed typo (plural)
const {
    notFound,
    errorHandler,
} = require('./middlewares/errorMiddleware.js');

// 2. Load our environment variables from .env
dotenv.config();

// 3. Connect to our Database!
connectDB();

// 4. Initialize our Express application
const app = express();

// 5. Add core middleware
// MUST come *before* rate limiters and routes
const allowedOrigins = ["https://rent-manager-app.vercel.app", "https://rent-manager-app-git-main-rajneesh-sharmas-projects.vercel.app?_vercel_share=KYpsMRRDH6W3ZE4elvrCX3Z1jGr6s308", "https://rent-manager-app-git-main-rajneesh-sharmas-projects.vercel.app","http:localhost:5173"]
app.use(cors({
    origin: allowedOrigins
}));
app.use(express.json()); // To accept JSON data

// 6. --- Add Rate Limiters ---
// This is the correct place for them

// Apply a general limiter to all /api/ requests
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the 'RateLimit-*' headers
    legacyHeaders: false, // Disable the 'X-RateLimit-*' headers
});
app.use('/api', apiLimiter);

// Apply a *stricter* limit to the login route
const loginLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 10, // Limit to 10 login attempts per 30 mins
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
// This targets the login route specifically
app.use('/api/users/login', loginLimiter);

// 7. Define the port our server will run on
const PORT = process.env.PORT || 4000;

// 8. Test routes
app.get('/', (req, res) => {
    console.log('CHECKPOINT: Root / route was hit!');
    res.send('The server is alive!');
});

app.get('/api', (req, res) => {
    res.send('API is running successfully!');
});

//9. --- Use the routes ---
// These MUST come *after* the middleware
app.use('/api/users', userRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/expenses', expenseRoutes);

//10. --- Use the Error Middleware (MUST be after routes) ---
app.use(notFound); // 404 handler
app.use(errorHandler); // "Catch-all" handler

// 11. Start the server and listen for connections
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});