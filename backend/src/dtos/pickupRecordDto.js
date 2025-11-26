const { toStopDto } = require('./stopDto');
const { iso } = require('../utils/helpers');

function toPickupRecordDto(rec) {
	if (!rec) return null;
	return {
		recordId: rec.record_id,
		studentId: rec.student_id,
		stop: rec.stop_id ? toStopDto(rec.stop_id) : null,
		trip: rec.trip_id ? toTripDto_in_pickup(rec) : null,
		status: rec.status,
		recordedAt: iso(rec.recorded_at),
		student: rec.Student ? toStudentDto_in_pickup(rec.Student) : undefined,
		stop: rec.Stop ? toStopDto(rec.Stop) : undefined,
	};
}

function toTripDto_in_pickup(rec) {
	if (!rec) return null;
	return {
		tripId: rec.trip_id,
		scheduleId: rec.schedule_id,
		tripDate: rec.trip_date,
	};
}

function toStudentDto_in_pickup(rec) {
	if (!rec) return null;
	return {
		studentId: rec.student_id,
		name: rec.name,
		className: rec.Class ? rec.Class.name : null,
	};
}

module.exports = { toPickupRecordDto };
