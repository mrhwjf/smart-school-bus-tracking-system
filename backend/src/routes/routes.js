const { Router } = require('express');
const router = Router();
const { handleValidation } = require('../middlewares/handleValidation');

const { routeController } = require('../controllers');
const { createRouteRequest, updateRouteRequest, listRoutesQuery, replaceRouteStopsRequest, replaceRoutePassengersRequest } = require('../middlewares/validation');

// Routes CRUD
router.get('/routes', listRoutesQuery, handleValidation, routeController.listRoutes);
router.get('/routes/:routeId', routeController.getRoute);
router.post('/routes', createRouteRequest, handleValidation, routeController.createRoute);
router.put('/routes/:routeId', updateRouteRequest, handleValidation, routeController.updateRoute);
router.delete('/routes/:routeId', routeController.deleteRoute);

// Route Stops
router.get('/routes/:routeId/stops', routeController.getRouteStops);
router.put('/routes/:routeId/stops', replaceRouteStopsRequest, handleValidation, routeController.replaceRouteStops);

// Route Passengers
router.get('/routes/:routeId/passengers', routeController.getRoutePassengers);
router.put('/routes/:routeId/passengers', replaceRoutePassengersRequest, handleValidation, routeController.replaceRoutePassengers);

module.exports = router;
