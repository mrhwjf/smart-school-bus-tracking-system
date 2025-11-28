const { body, param, query } = require('express-validator');
const { PICKUP_STATUS } = require('../../config/constants');

const listPickupRecordsQuery = [
	query('page').optional().isInt({ min: 0 }).toInt(),
	query('size').optional().isInt({ min: 1, max: 200 }).toInt(),
	query('tripId').optional().isInt({ min: 1 }).toInt(),
	query('studentId').optional().isInt({ min: 1 }).toInt(),
];

const createPickupRecordRequest = [
	body('studentId').isInt({ min: 1 }).toInt(),
	body('stopId').isInt({ min: 1 }).toInt(),
	body('tripId').isInt({ min: 1 }).toInt(),
	body('status').optional().isIn(PICKUP_STATUS),
	body('recordedAt').optional().isISO8601(),
];

const updatePickupRecordRequest = [
	param('recordId').isInt({ min: 1 }).toInt(),
	body('status').optional().isIn(PICKUP_STATUS),
	body('recordedAt').optional().isISO8601(),
];

module.exports = {
	listPickupRecordsQuery,
	createPickupRecordRequest,
	updatePickupRecordRequest,
};
