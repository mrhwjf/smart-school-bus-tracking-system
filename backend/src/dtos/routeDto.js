const { toStopDto } = require("./stopDto");

function toRouteDto(route) {
	if (!route) return null;

	return {
		routeId: route.route_id,
		name: route.name,
		description: route.description || null,
		stops: route.Stops
			? route.Stops.map(stop => {
				const stopDto = toStopDto(stop);

				// Map students from RoutePassengers
				stopDto.students = stop.RoutePassengers
					? stop.RoutePassengers.map(rp => {
						return toStudentDto_in_routePassenger(rp);
					})
					: [];

				return stopDto;
			})
			: [],
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

module.exports = { toRouteDto };