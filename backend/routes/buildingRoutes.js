// File: backend/routes/buildingRoutes.js

const express = require('express');
const router = express.Router();
const {
    createBuilding,
    getMyBuildings,
    getBuildingById,
    updateBuilding,
    deleteBuilding,
} = require('../controllers/buildingController.js');
const {
    protect,
    admin
} = require('../middlewares/authMiddleware.js');

// --- Apply the middleware ---
// This is the magic! Any route defined in this file
// will first run 'protect', then 'admin', then the controller function.
router.use(protect, admin);

// --- Define the routes ---
router.route('/').post(createBuilding).get(getMyBuildings);

router
    .route('/:id')
    .get(getBuildingById)
    .put(updateBuilding)
    .delete(deleteBuilding);

module.exports = router;