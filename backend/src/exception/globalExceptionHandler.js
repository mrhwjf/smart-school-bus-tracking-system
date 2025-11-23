const {
	ValidationError,
	UniqueConstraintError,
	ForeignKeyConstraintError,
	DatabaseError,
} = require('sequelize');

// Our simple HttpError factory attaches `status` to Error

/**
 * Global Express error-handling middleware
 * Contract:
 * - Input: (err, req, res, next)
 * - Output: JSON { error, details?, status?, stack?, context? }
 * - Honors err.status (from createHttpError) and maps common Sequelize/JWT/JSON errors.
 */
function globalExceptionHandler(err, req, res, next) {
	// If headers were already sent, delegate to default Express handler
	if (res.headersSent) return next(err);

	const isProd = process.env.NODE_ENV === 'production';

	let status = err && err.status ? err.status : 500;
	let message = (err && err.message) || 'Internal Server Error';
	let details;

	// Map common Sequelize errors
	if (err instanceof ValidationError) {
		status = 400;
		message = 'Validation error';
		details = Array.isArray(err.errors)
			? err.errors.map((e) => ({ field: e.path, message: e.message, validator: e.validator }))
			: undefined;
	} else if (err instanceof UniqueConstraintError) {
		status = 409;
		message = 'Duplicate value violates unique constraint';
		details = Array.isArray(err.errors)
			? err.errors.map((e) => ({ field: e.path, message: e.message }))
			: undefined;
	} else if (err instanceof ForeignKeyConstraintError) {
		status = 409;
		message = 'Foreign key constraint violation';
		details = [{ table: err.table, fields: err.fields }];
	} else if (err instanceof DatabaseError) {
		status = status === 500 ? 500 : status; // keep explicit status if set
		message = 'Database error';
	}

	// JSON body parse error from express.json()
	if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) {
		status = 400;
		message = 'Invalid JSON payload';
	}

	// JWT errors (if auth middleware uses jsonwebtoken)
	if (err && err.name === 'JsonWebTokenError') {
		status = 401;
		message = 'Invalid authentication token';
	} else if (err && err.name === 'TokenExpiredError') {
		status = 401;
		message = 'Authentication token expired';
	}

	// Attach context-aware logging (minimal in production)
	const logPayload = {
		message: err && err.message,
		status,
		method: req.method,
		path: req.originalUrl || req.url,
		context: err && err.context,
	};
	if (!isProd) logPayload.stack = err && err.stack;
	// eslint-disable-next-line no-console
	console.error('[Error]', logPayload);

	const payload = { error: message };
	if (details) payload.details = details;
	if (!isProd) {
		payload.status = status;
		if (err && err.context) payload.context = err.context;
		if (err && err.stack) payload.stack = err.stack;
	}

	res.status(status).json(payload);
}

module.exports = globalExceptionHandler;
