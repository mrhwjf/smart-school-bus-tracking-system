const { body, param, query } = require('express-validator');

const listMessagesQuery = [
	query('page').optional().isInt({ min: 0 }).toInt(),
	query('size').optional().isInt({ min: 1, max: 200 }).toInt(),
	query('senderId').optional().isInt({ min: 1 }).toInt(),
];

const createMessageRequest = [
	body('messageText').isString().trim().notEmpty(),
	body('senderId').optional().isInt({ min: 1 }).toInt(),
	body('sentAt').optional().isISO8601(),
];

const updateMessageRequest = [
	param('messageId').isInt({ min: 1 }).toInt(),
	body('messageText').optional().isString().trim().notEmpty(),
];

module.exports = {
	listMessagesQuery,
	createMessageRequest,
	updateMessageRequest,
};
