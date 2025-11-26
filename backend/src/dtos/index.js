// Use ...require() instead
module.exports = {
	// Master data DTOs
	...require('./roleDto'),
	...require('./userDto'),
	...require('./parentDto'),
	...require('./driverDto'),
	...require('./studentDto'),
	...require('./busDto'),
	...require('./routeDto'),
	...require('./stopDto'),
	...require('./classDto'),
	// Transactional DTOs
	...require('./tripDto'),
	...require('./scheduleDto'),
	...require('./scheduleDayDto'),
	...require('./routeStopDto'),
	...require('./routePassengerDto'),
	...require('./pickupRecordDto'),
	...require('./messageDto'),
	...require('./notificationDto'),
	...require('./userNotificationDto'),
}
