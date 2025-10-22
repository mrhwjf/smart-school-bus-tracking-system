const express = require('express');
const controller = require('../controller/tripStop.controller');
const router = express.Router();

router.get('/:tripId', controller.listByTrip);
router.post('/:tripId', controller.addStop);
router.put('/:tripId/:stopId', controller.updateOrder);
router.delete('/:tripId/:stopId', controller.removeStop);
router.put('/:tripId/replace', controller.replaceAll);

module.exports = router;
