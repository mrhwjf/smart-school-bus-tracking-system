const { body, param, query } = require('express-validator');

const createStopRequest = [
	body('name').isString().trim().notEmpty().isLength({ max: 255 }),
	body('latitude').isFloat({ min: -90, max: 90 }).toFloat(),
	body('longitude').isFloat({ min: -180, max: 180 }).toFloat(),
	body('address').optional().isString().isLength({ max: 255 }),
	body('active').optional().isBoolean().toBoolean(),
];

const updateStopRequest = [
	param('stopId').isInt({ min: 1 }).toInt(),
	body('name').optional().isString().trim().isLength({ max: 255 }),
	body('latitude').optional().isFloat({ min: -90, max: 90 }).toFloat(),
	body('longitude').optional().isFloat({ min: -180, max: 180 }).toFloat(),
	body('address').optional().isString().isLength({ max: 255 }),
	body('active').optional().isBoolean().toBoolean(),
];

module.exports = { createStopRequest, updateStopRequest };

const listStopsQuery = [
	query('page').optional().isInt({ min: 0 }).toInt(),
	query('size').optional().isInt({ min: 1, max: 100 }).toInt(),
	query('name').optional().isString().trim().isLength({ max: 255 }),
	query('address').optional().isString().trim().isLength({ max: 255 }),
	query('active').optional().isBoolean().toBoolean(),
	query('sortField').optional().isIn(['stop_id', 'name', 'created_at']).toLowerCase(),
	query('sortDirection').optional().isIn(['ASC', 'DESC', 'asc', 'desc']).customSanitizer(v => String(v).toUpperCase()),
];

module.exports = { createStopRequest, updateStopRequest, listStopsQuery };
