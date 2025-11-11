const { toStudentDto } = require('./studentDto');

function toRoutePassengerDto(rp) {
	if (!rp) return null;
	return {
		routeId: rp.route_id,
		studentId: rp.student_id,
		student: rp.Student ? toStudentDto(rp.Student) : undefined,
	};
}

module.exports = { toRoutePassengerDto };
