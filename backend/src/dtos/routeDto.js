const { toStopDto } = require("./stopDto");

function toRouteDto(route) {
	if (!route) return null;
	return {
		routeId: route.route_id,
		name: route.name,
		description: route.description || null,
		stops: route.Stops ? route.Stops.map(s => ({ ...toStopDto(s), stopOrder: s.RouteStop ? (typeof s.RouteStop.stop_order === 'number' ? s.RouteStop.stop_order : Number(s.RouteStop.stop_order) || 0) : 0 })) : undefined
	};
}

module.exports = { toRouteDto };
