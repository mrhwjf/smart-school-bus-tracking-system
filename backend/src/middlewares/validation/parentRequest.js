const { body, param } = require('express-validator');
const { RELATIONSHIPS } = require('../../config/constants');

const createParentRequest = [
	body('parentId').isInt({ min: 1 }).toInt(), // link to existing users.user_id
	body('relationship').optional().isIn(RELATIONSHIPS),
];

const updateParentRequest = [
	param('parentId').isInt({ min: 1 }).toInt(),
	body('relationship').optional().isIn(RELATIONSHIPS),
];

module.exports = { createParentRequest, updateParentRequest };
