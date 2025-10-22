const express = require('express');
const router = express.Router();

// Routes domain
const routeRoutes = require('./route.routes');
const stopRoutes = require('./stop.routes');
const tripRoutes = require('./trip.routes');
const tripStopRoutes = require('./tripStop.routes');
const tripPassengerRoutes = require('./tripPassenger.routes');

router.use('/routes', routeRoutes);
router.use('/stops', stopRoutes);
router.use('/trips', tripRoutes);
router.use('/trip-stops', tripStopRoutes);
router.use('/trip-passengers', tripPassengerRoutes);

module.exports = router;
