const { toRouteDto } = require('./routeDto');
const { toBusDto } = require('./busDto');
const { toDriverDto } = require('./driverDto');

function toScheduleDto(s) {
	if (!s) return null;

	return {
		scheduleId: s.schedule_id,
		routeId: s.route_id,
		busId: s.bus_id,
		driverId: s.driver_id,
		shift: s.shift,
		startTime: s.start_time,
		endTime: s.end_time,
		active: !!s.active,

		route: s.Route ? toRouteDto(s.Route) : undefined,
		bus: s.Bus ? toBusDto(s.Bus) : undefined,
		driver: s.Driver ? toDriverDto(s.Driver) : undefined,
		days: s.ScheduleDays?.map(sd => sd.day_of_week),
	};
}


module.exports = { toScheduleDto };
