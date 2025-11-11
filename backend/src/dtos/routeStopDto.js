const { toRouteDto } = require('./routeDto');
const { toStopDto } = require('./stopDto');

function toRouteStopDto(rs) {
	if (!rs) return null;
	return {
		routeId: rs.route_id,
		stopId: rs.stop_id,
		stopOrder: typeof rs.stop_order === 'number' ? rs.stop_order : (rs.stop_order ? Number(rs.stop_order) : 0),
		stop: rs.Stop ? toStopDto(rs.Stop) : undefined,
		route: rs.Route ? toRouteDto(rs.Route) : undefined,
	};
}

function toRouteStopsDtoList(routeStops) {
	if (!Array.isArray(routeStops)) return [];
	return routeStops.map(toRouteStopDto);
}

module.exports = { toRouteStopDto, toRouteStopsDtoList };
