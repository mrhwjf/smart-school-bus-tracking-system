const { body, param, query } = require('express-validator');
const { NOTIFICATION_TYPES } = require('../../config/constants');

const listNotificationsQuery = [
	query('page').optional().isInt({ min: 0 }).toInt(),
	query('size').optional().isInt({ min: 1, max: 200 }).toInt(),
	query('type').optional().isIn(NOTIFICATION_TYPES),
];

const createNotificationRequest = [
	body('messageId').isInt({ min: 1 }).toInt(),
	body('type').optional().isIn(NOTIFICATION_TYPES),
	body('sentAt').optional().isISO8601(),
];

const updateNotificationRequest = [
	param('notificationId').isInt({ min: 1 }).toInt(),
	body('type').optional().isIn(NOTIFICATION_TYPES),
];

module.exports = {
	listNotificationsQuery,
	createNotificationRequest,
	updateNotificationRequest,
};
