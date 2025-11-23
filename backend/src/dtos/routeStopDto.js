const { toRouteDto } = require('./routeDto');
const { toStopDto } = require('./stopDto');

function toRouteStopDto(rs) {
	if (!rs) return null;
	return {
		routeId: rs.route_id,
		stopId: rs.stop_id,
		stopOrder: typeof rs.stop_order === 'number' ? rs.stop_order : (rs.stop_order ? Number(rs.stop_order) : 0),
		stop: rs.Stop ? toStopDto(rs.Stop) : undefined,
		route: rs.Route ? toRouteDto_in_routeStop(rs.Route) : undefined,
	};
}

function toRouteDto_in_routeStop(route) {
	if (!route) return null;
	return {
		routeId: route.route_id,
		name: route.name,
		description: route.description || null,
	};
}
module.exports = { toRouteStopDto };