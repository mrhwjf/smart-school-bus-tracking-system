const { body, param } = require('express-validator');
const { WEEKDAYS } = require('../../config/constants');

const addScheduleDayRequest = [
	body('scheduleId').isInt({ min: 1 }).toInt(),
	body('dayOfWeek').isIn(WEEKDAYS),
];

const removeScheduleDayRequest = [
	param('scheduleId').isInt({ min: 1 }).toInt(),
	param('dayOfWeek').isIn(WEEKDAYS),
];

module.exports = { addScheduleDayRequest, removeScheduleDayRequest };
