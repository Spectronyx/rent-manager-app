// File: backend/routes/roomRoutes.js

const express = require('express');
const router = express.Router();
const {
    createRoom,
    getRoomsInBuilding,
    getRoomById,
    updateRoom,
    assignTenantToRoom,
    vacateRoom,
    deleteRoom
} = require('../controllers/roomController.js');
const {
    protect,
    admin
} = require('../middlewares/authMiddleware.js');

// Apply admin protection to all routes in this file
router.use(protect, admin);

// --- Define the routes ---

// POST /api/rooms
router.route('/').post(createRoom);

// GET /api/rooms/building/:buildingId
router.route('/building/:buildingId').get(getRoomsInBuilding);

// PUT /api/rooms/:id/assign
router.route('/:id/assign').put(assignTenantToRoom);

// PUT /api/rooms/:id/vacate
router.route('/:id/vacate').put(vacateRoom);

// GET, PUT, DELETE /api/rooms/:id
router
    .route('/:id')
    .get(getRoomById)
    .put(updateRoom)
    .delete(deleteRoom);

module.exports = router;