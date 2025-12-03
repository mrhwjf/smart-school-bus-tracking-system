const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

// Bắt đầu mô phỏng cho một trip
router.post('/trips/:tripId/start', simulationController.startSimulation);

// Bắt đầu mô phỏng với route data trực tiếp
router.post('/start', simulationController.startSimulationWithRoute);

// Dừng mô phỏng cho một xe
router.post('/buses/:busId/stop', simulationController.stopSimulation);

// Dừng tất cả mô phỏng
router.post('/stop-all', simulationController.stopAllSimulations);

// Lấy vị trí của một xe
router.get('/buses/:busId/location', simulationController.getBusLocation);

// Lấy tất cả vị trí xe
router.get('/buses/locations', simulationController.getAllBusLocations);

// Lấy danh sách simulation đang chạy
router.get('/active', simulationController.getActiveSimulations);

// Kiểm tra trạng thái simulation của 1 xe
router.get('/buses/:busId/status', simulationController.getSimulationStatus);

module.exports = router;
