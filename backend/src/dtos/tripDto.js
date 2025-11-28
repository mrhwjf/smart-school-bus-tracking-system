const { toScheduleDto } = require('./scheduleDto');
const { toStudentDto } = require('./studentDto');
const { iso } = require('../utils/helpers');

function toTripDto(trip) {
	if (!trip) return null;
	return {
		tripId: trip.trip_id,
		scheduleId: trip.schedule_id,
		tripDate: trip.trip_date,
		driverId: trip.driver_id ?? null,
		actualStartTime: iso(trip.actual_start_time),
		actualEndTime: iso(trip.actual_end_time),
		status: trip.status,
		schedule: trip.Schedule ? toScheduleDto(trip.Schedule) : undefined,
		passengers: Array.isArray(trip.Students) ? trip.Students.map(s => toStudentDto(s)) : undefined,
	};
}

module.exports = { toTripDto };