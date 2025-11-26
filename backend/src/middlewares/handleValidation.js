const { validationResult } = require('express-validator');

function handleValidation(req, res, next) {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		return res.status(400).json({
			message: 'Validation failed',
			success: false,
			data: result.array(),
			timestamp: new Date().toISOString(),
		});
	}
	return next();
}

module.exports = { handleValidation };