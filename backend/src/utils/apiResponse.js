const apiResponse = {
	success(message, data = null) {
		return {
			message,
			success: true,
			data,
			timestamp: new Date().toISOString(),
		};
	},

	failure(message) {
		return {
			message,
			success: false,
			data: null,
			timestamp: new Date().toISOString(),
		};
	},
};

module.exports = apiResponse;