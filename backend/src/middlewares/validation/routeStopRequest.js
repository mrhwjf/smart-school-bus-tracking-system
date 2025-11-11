const { body, param } = require('express-validator');

const addRouteStopRequest = [
	body('routeId').isInt({ min: 1 }).toInt(),
	body('stopId').isInt({ min: 1 }).toInt(),
	body('stopOrder').optional().isInt({ min: 0 }).toInt(),
];

const updateRouteStopRequest = [
	param('routeId').isInt({ min: 1 }).toInt(),
	param('stopId').isInt({ min: 1 }).toInt(),
	body('stopOrder').optional().isInt({ min: 0 }).toInt(),
];

const removeRouteStopRequest = [
	param('routeId').isInt({ min: 1 }).toInt(),
	param('stopId').isInt({ min: 1 }).toInt(),
];

module.exports = { addRouteStopRequest, updateRouteStopRequest, removeRouteStopRequest };
