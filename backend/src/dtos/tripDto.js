const { toScheduleDto } = require('./scheduleDto');
const { toStudentDto } = require('./studentDto');
const { iso } = require('../utils/helpers');

function toTripDto(trip) {
	if (!trip) return null;
	
	// Extract nested data from Schedule if present
	const schedule = trip.Schedule;
	const route = schedule?.Route;
	const bus = schedule?.Bus;
	const driver = schedule?.Driver;
	const driverUser = driver?.User;
	
	// Process stops with order
	const stops = route?.Stops ? route.Stops.map(stop => ({
		stop_id: stop.stop_id,
		name: stop.name,
		latitude: stop.latitude,
		longitude: stop.longitude,
		address: stop.address,
		stop_order: stop.RouteStop?.stop_order || 0
	})).sort((a, b) => a.stop_order - b.stop_order) : [];
	
	return {
		tripId: trip.trip_id,
		tripDate: trip.trip_date,
		actualStartTime: iso(trip.actual_start_time),
		actualEndTime: iso(trip.actual_end_time),
		status: trip.status,
		// Flattened schedule data
		scheduleId: trip.schedule_id,
		shift: schedule?.shift,
		startTime: schedule?.start_time,
		endTime: schedule?.end_time,
		// Route info
		route: route ? {
			route_id: route.route_id,
			name: route.name,
			description: route.description
		} : null,
		// Bus info
		bus: bus ? {
			bus_id: bus.bus_id,
			plate_number: bus.plate_number,
			model: bus.model,
			capacity: bus.capacity,
			status: bus.status
		} : null,
		// Driver info (prefer override driver_id if present)
		driver: driverUser ? {
			user_id: driver.driver_id,
			name: driverUser.name,
			phone_number: driverUser.phone_number,
			license_number: driver.license_number
		} : null,
		// Ordered stops
		stops,
		passengers: Array.isArray(trip.Students) ? trip.Students.map(s => toStudentDto(s)) : undefined,
	};
}

module.exports = { toTripDto };