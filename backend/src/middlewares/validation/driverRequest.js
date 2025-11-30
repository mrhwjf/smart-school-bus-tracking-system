const { body, param } = require('express-validator');

const createDriverRequest = [
	body('driverId').isInt({ min: 1 }).toInt(), // link to existing users.user_id
	body('licenseNumber').isString().trim().notEmpty().isLength({ max: 50 }),
	body('vehiclePermit').optional().isString().isLength({ max: 100 }),
];

const updateDriverRequest = [
	param('driverId').isInt({ min: 1 }).toInt(),
	body('licenseNumber').optional().isString().trim().isLength({ max: 50 }),
	body('vehiclePermit').optional().isString().isLength({ max: 100 }),
];

module.exports = { createDriverRequest, updateDriverRequest };
