const { body, param, query } = require('express-validator');
const { TRIP_STATUSES } = require('../../config/constants');

const listTripsQuery = [
	query('page').optional().isInt({ min: 0 }).toInt(),
	query('size').optional().isInt({ min: 1, max: 200 }).toInt(),
	query('scheduleId').optional().isInt({ min: 1 }).toInt(),
	query('tripDate').optional().isISO8601(),
	query('status').optional().isIn(TRIP_STATUSES),
];

const createTripRequest = [
	body('scheduleId').isInt({ min: 1 }).toInt(),
	body('tripDate').isISO8601(),
	body('driverId').optional().isInt({ min: 1 }).toInt(),
	body('actualStartTime').optional().isISO8601(),
	body('actualEndTime').optional().isISO8601(),
	body('status').optional().isIn(TRIP_STATUSES),
];

const updateTripRequest = [
	param('tripId').isInt({ min: 1 }).toInt(),
	body('scheduleId').optional().isInt({ min: 1 }).toInt(),
	body('tripDate').optional().isISO8601(),
	body('driverId').optional().isInt({ min: 1 }).toInt(),
	body('actualStartTime').optional().isISO8601(),
	body('actualEndTime').optional().isISO8601(),
	body('status').optional().isIn(TRIP_STATUSES),
];

module.exports = { listTripsQuery, createTripRequest, updateTripRequest };
