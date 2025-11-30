const { body, param, query } = require('express-validator');
const { SHIFT, TIME_PATTERN, WEEKDAYS } = require('../../config/constants');
const { BusRepository } = require('../../repositories');

const listSchedulesQuery = [
	query('routeId').optional().isInt({ min: 1 }).toInt(),
	query('busId').optional().isInt({ min: 1 }).toInt(),
	query('driverId').optional().isInt({ min: 1 }).toInt(),
	query('shift').optional().isIn(SHIFT),
	query('active').optional().isBoolean().toBoolean(),
	query('page').optional().isInt({ min: 0 }).toInt(),
	query('size').optional().isInt({ min: 1, max: 100 }).toInt(),
	query('sortField').optional().isIn(['schedule_id', 'start_time', 'created_at']).toLowerCase(),
	query('sortDirection').optional().isIn(['ASC', 'DESC', 'asc', 'desc']).customSanitizer(v => String(v).toUpperCase()),
];

const createScheduleRequest = [
	body('routeId').isInt({ min: 1 }).toInt(),
	body('busId').isInt({ min: 1 }).toInt(),
	body('driverId').isInt({ min: 1 }).toInt(),
	body('shift').optional().isIn(SHIFT),
	body('startTime').matches(TIME_PATTERN),
	body('endTime').matches(TIME_PATTERN),
	body('active').optional().isBoolean().toBoolean(),
	body('days').optional().isArray(),
	body('days.*').optional().isIn(WEEKDAYS),
	// ensure bus is ACTIVE
	body('busId').custom(async (value) => {
		const bus = await BusRepository.findById(value);
		if (!bus || (bus.status && bus.status !== 'ACTIVE')) throw new Error('Bus must be ACTIVE');
		return true;
	}),
];

const updateScheduleRequest = [
	param('scheduleId').isInt({ min: 1 }).toInt(),
	body('routeId').optional().isInt({ min: 1 }).toInt(),
	body('busId').optional().isInt({ min: 1 }).toInt(),
	body('driverId').optional().isInt({ min: 1 }).toInt(),
	body('shift').optional().isIn(SHIFT),
	body('startTime').optional().matches(TIME_PATTERN),
	body('endTime').optional().matches(TIME_PATTERN),
	body('active').optional().isBoolean().toBoolean(),
	body('days').optional().isArray(),
	body('days.*').optional().isIn(WEEKDAYS),
	body('busId').optional().custom(async (value) => {
		if (value == null) return true;
		const bus = await BusRepository.findById(value);
		if (!bus || (bus.status && bus.status !== 'ACTIVE')) throw new Error('Bus must be ACTIVE');
		return true;
	}),
];
// replace days request
const replaceScheduleDaysRequest = [
	param('scheduleId').isInt({ min: 1 }).toInt(),
	body('days').isArray(),
	body('days.*').isIn(WEEKDAYS),
];

module.exports = { listSchedulesQuery, createScheduleRequest, updateScheduleRequest, replaceScheduleDaysRequest };
