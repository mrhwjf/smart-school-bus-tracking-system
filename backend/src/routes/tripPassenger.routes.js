const express = require('express');
const controller = require('../controller/tripPassenger.controller');
const router = express.Router();

router.get('/:tripId', controller.listByTrip);
router.post('/:tripId', controller.addPassenger);
router.post('/:tripId/bulk', controller.bulkAddPassengers);
router.delete('/:tripId/:studentId', controller.removePassenger);
router.delete('/:tripId', controller.clearPassengers);

module.exports = router;
