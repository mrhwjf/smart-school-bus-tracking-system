const { body, param, query } = require('express-validator');

const listUserNotificationsQuery = [
	query('page').optional().isInt({ min: 0 }).toInt(),
	query('size').optional().isInt({ min: 1, max: 200 }).toInt(),
	query('recipientId').optional().isInt({ min: 1 }).toInt(),
	query('readStatus').optional().isBoolean().toBoolean(),
];

const createUserNotificationRequest = [
	body('notificationId').isInt({ min: 1 }).toInt(),
	body('recipientId').isInt({ min: 1 }).toInt(),
	body('readStatus').optional().isBoolean().toBoolean(),
];

const updateUserNotificationRequest = [
	param('notificationId').isInt({ min: 1 }).toInt(),
	param('recipientId').isInt({ min: 1 }).toInt(),
	body('readStatus').isBoolean().toBoolean(),
];

module.exports = {
	listUserNotificationsQuery,
	createUserNotificationRequest,
	updateUserNotificationRequest,
};
