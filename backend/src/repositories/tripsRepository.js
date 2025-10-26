const BaseRepository = require('./baseRepository');
const db = require('../models');
const { Op } = require('sequelize');

class TripsRepository extends BaseRepository {
	constructor() {
		super(db.Trip, { sortableFields: ['created_at', 'updated_at', 'start_time', 'end_time', 'trip_id'] });
	}

	buildWhere(filter = {}) {
		const where = {};
		const { trip_id, route_id, bus_id, status, shift, start_from, start_to } = filter;
		if (trip_id) where.trip_id = trip_id;
		if (route_id) where.route_id = route_id;
		if (bus_id) where.bus_id = bus_id;
		if (status) where.status = status;
		if (shift) where.shift = shift;
		if (start_from || start_to) {
			where.start_time = {};
			if (start_from) where.start_time[Op.gte] = new Date(start_from);
			if (start_to) where.start_time[Op.lte] = new Date(start_to);
		}
		return where;
	}
}

module.exports = new TripsRepository();
