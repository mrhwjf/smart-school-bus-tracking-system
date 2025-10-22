const express = require('express');
const controller = require('../controller/trip.controller');
const router = express.Router();

router.get('/', controller.getTrips);
router.get('/:id', controller.getTripById);
router.post('/', controller.createTrip);
router.put('/:id', controller.updateTrip);
router.delete('/:id', controller.deleteTrip);

// bulk ops
router.post('/:tripId/stops', controller.setStops);
router.post('/:tripId/passengers', controller.setPassengers);
router.post('/:tripId/stops-passengers', controller.setStopsAndPassengers);

module.exports = router;
