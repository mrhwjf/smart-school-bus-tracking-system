const { toStudentDto } = require('./studentDto');
const { toStopDto } = require('./stopDto');
const { iso } = require('../utils/helpers');

function toPickupRecordDto(rec) {
	if (!rec) return null;
	return {
		recordId: rec.record_id,
		studentId: rec.student_id,
		stopId: rec.stop_id,
		tripId: rec.trip_id,
		status: rec.status,
		recordedAt: iso(rec.recorded_at),
		student: rec.Student ? toStudentDto(rec.Student) : undefined,
		stop: rec.Stop ? toStopDto(rec.Stop) : undefined,
	};
}

module.exports = { toPickupRecordDto };
