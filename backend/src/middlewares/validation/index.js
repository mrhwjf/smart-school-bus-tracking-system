module.exports = {
	// Master data
	...require('./busRequest'),
	...require('./routeRequest'),
	...require('./stopRequest'),
	...require('./studentRequest'),
	...require('./driverRequest'),
	...require('./parentRequest'),
	...require('./userRequest'),

	// Transactional
	...require('./tripRequest'),
	...require('./scheduleRequest'),
	...require('./scheduleDayRequest'),
	...require('./pickupRecordRequest'),
	...require('./messageRequest'),
	...require('./notificationRequest'),
	...require('./userNotificationRequest'),
};
