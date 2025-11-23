const { body, param, query } = require('express-validator');

// Create Route Request
const createRouteRequest = [
	body('name').isString().trim().notEmpty().isLength({ max: 255 }),
	body('description').optional().isString(),
];

// Update Route Request
const updateRouteRequest = [
	param('routeId').isInt({ min: 1 }).toInt(),
	body('name').optional().isString().trim().isLength({ max: 255 }),
	body('description').optional().isString(),
	body('stops').optional().isArray(),

	// Validate each stop if provided
	body('stops.*.stopId').optional().isInt({ min: 1 }).toInt(),
	body('stops.*.students').optional().isArray(),
	body('stops.*.students.*.studentId').optional().isInt({ min: 1 }).toInt(),
];

// List Routes Query
const listRoutesQuery = [
	query('page').optional().isInt({ min: 0 }).toInt(),
	query('size').optional().isInt({ min: 1, max: 100 }).toInt(),
	query('name').optional().isString().trim().isLength({ max: 255 }),
	query('sortField').optional().isIn(['route_id', 'name', 'created_at']).toLowerCase(),
	query('sortDirection')
		.optional()
		.isIn(['ASC', 'DESC', 'asc', 'desc'])
		.customSanitizer(v => String(v).toUpperCase()),
];

// Replace Route Stops
const replaceRouteStopsRequest = [
	param('routeId').isInt({ min: 1 }).toInt(),
	body('stops').isArray().withMessage('stops must be an array'),
	body('stops.*.stopId').isInt({ min: 1 }).toInt(),
	body('stops.*.stopOrder').optional().isInt({ min: 0 }).toInt(),
];

// Replace Route Passengers
const replaceRoutePassengersRequest = [
	param('routeId').isInt({ min: 1 }).toInt(),
	body('stops').isArray().withMessage('stops must be an array'),
	body('stops.*.stopId').isInt({ min: 1 }).toInt(),
	body('stops.*.studentIds').isArray().withMessage('studentIds must be an array of integers'),
	body('stops.*.studentIds.*').isInt({ min: 1 }).toInt(),
];

module.exports = {
	createRouteRequest,
	updateRouteRequest,
	listRoutesQuery,
	replaceRouteStopsRequest,
	replaceRoutePassengersRequest,
};
