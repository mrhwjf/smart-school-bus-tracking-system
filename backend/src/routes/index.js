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
// Mount student routes
const studentsRouter = require('./students');
router.use('/students', studentsRouter);

// Additional entity routes
const parentsRouter = require('./parents');
router.use('/parents', parentsRouter);

const pickupRecordsRouter = require('./pickupRecords');
router.use('/pickup-records', pickupRecordsRouter);

const usersRouter = require('./users');
router.use('/users', usersRouter);

const rolesRouter = require('./roles');
router.use('/roles', rolesRouter);

module.exports = router;
