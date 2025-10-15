module.exports = function createHttpError(status, message) {
	const err = new Error(message || 'Error');
	err.status = status || 500;
	return err;
};
