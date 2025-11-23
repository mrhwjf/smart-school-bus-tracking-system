const { toStopDto } = require('./stopDto');

function toRoutePassengerDto(rp) {
	if (!rp) return null;
	return {
		routeId: rp.route_id,
		stopId: rp.stop_id,
		studentId: rp.student_id,
		stop: rp.Stop ? toStopDto(rp.Stop) : undefined,
		student: rp.Student ? toStudentDto_in_routePassenger(rp.Student)
			: undefined,
	};
}

function toStudentDto_in_routePassenger(rp) {
	if (!rp) return null;
	return {
		studentId: rp.student_id,
		name: rp.name,
		className: rp.Class ? rp.Class.name : null,
	};
}

module.exports = { toRoutePassengerDto };
