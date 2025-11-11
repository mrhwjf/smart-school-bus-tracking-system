const { body, param } = require('express-validator');

const addRoutePassengerRequest = [
	body('routeId').isInt({ min: 1 }).toInt(),
	body('studentId').isInt({ min: 1 }).toInt(),
];

const removeRoutePassengerRequest = [
	param('routeId').isInt({ min: 1 }).toInt(),
	param('studentId').isInt({ min: 1 }).toInt(),
];

module.exports = { addRoutePassengerRequest, removeRoutePassengerRequest };
