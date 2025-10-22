const express = require('express');
const controller = require('../controller/stop.controller');
const router = express.Router();

router.get('/by-route/:routeId', controller.getStopsByRoute);
router.get('/:id', controller.getStopById);
router.post('/by-route/:routeId', controller.createStopForRoute);
router.post('/', controller.createStopForRoute);
router.put('/:id', controller.updateStop);
router.delete('/:id', controller.deleteStop);

module.exports = router;
