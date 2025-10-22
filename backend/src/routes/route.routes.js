const express = require('express');
const controller = require('../controller/route.controller');
const router = express.Router();

router.get('/', controller.getAllRoutes);
router.get('/:id', controller.getRouteById);
router.post('/', controller.createRoute);
router.put('/:id', controller.updateRoute);
router.delete('/:id', controller.deleteRoute);

module.exports = router;
