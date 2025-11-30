const { body, param, query } = require('express-validator');
const { BUS_STATUSES } = require('../../config/constants');

const createBusRequest = [
	body('plateNumber').isString().trim().notEmpty().isLength({ max: 20 }).withMessage('plateNumber is required (<=20)'),
	body('model').optional().isString().isLength({ max: 100 }),
	body('status').optional().isIn(BUS_STATUSES),
	body('capacity').optional().isInt({ min: 0 }).toInt(),
	body('driverId').optional().isInt({ min: 1 }).toInt(),
];

const updateBusRequest = [
	param('busId').isInt({ min: 1 }).toInt(),
	body('plateNumber').optional().isString().trim().isLength({ max: 20 }),
	body('model').optional().isString().isLength({ max: 100 }),
	body('status').optional().isIn(BUS_STATUSES),
	body('capacity').optional().isInt({ min: 0 }).toInt(),
	body('driverId').optional().isInt({ min: 1 }).toInt(),
];

module.exports = { createBusRequest, updateBusRequest };
// List query validator
const listBusesQuery = [
	query('page').optional().isInt({ min: 0 }).toInt(),
	query('size').optional().isInt({ min: 1, max: 100 }).toInt(),
	query('status').optional().isIn(BUS_STATUSES),
	query('plateNumber').optional().isString().trim().isLength({ max: 20 }),
	query('model').optional().isString().trim().isLength({ max: 100 }),
	query('sortField').optional().isIn(['bus_id', 'plate_number', 'created_at']).toLowerCase(),
	query('sortDirection').optional().isIn(['ASC', 'DESC', 'asc', 'desc']).customSanitizer(v => String(v).toUpperCase()),
];

module.exports = { createBusRequest, updateBusRequest, listBusesQuery };
