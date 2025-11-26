const { body, param, query } = require('express-validator');

const listUsersQuery = [
	query('page').optional().isInt({ min: 0 }).toInt(),
	query('size').optional().isInt({ min: 1, max: 200 }).toInt(),
	query('roleId').optional().isInt({ min: 1 }).toInt(),
	query('locked').optional().isBoolean().toBoolean(),
];

const createUserRequest = [
	body('roleId').isInt({ min: 1 }).toInt(),
	body('name').isString().trim().notEmpty().isLength({ max: 255 }),
	body('phoneNumber').optional().isString().isLength({ max: 20 }),
	body('email').optional().isEmail().isLength({ max: 255 }).normalizeEmail(),
	body('password').isString().isLength({ min: 6, max: 255 }),
	body('locked').optional().isBoolean().toBoolean(),
];

const updateUserRequest = [
	param('userId').isInt({ min: 1 }).toInt(),
	body('roleId').optional().isInt({ min: 1 }).toInt(),
	body('name').optional().isString().trim().isLength({ max: 255 }),
	body('phoneNumber').optional().isString().isLength({ max: 20 }),
	body('email').optional().isEmail().isLength({ max: 255 }).normalizeEmail(),
	body('password').optional().isString().isLength({ min: 6, max: 255 }),
	body('locked').optional().isBoolean().toBoolean(),
];

module.exports = { listUsersQuery, createUserRequest, updateUserRequest };
