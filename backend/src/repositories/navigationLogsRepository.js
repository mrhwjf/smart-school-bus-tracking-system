const BaseRepository = require('./baseRepository');
const db = require('../models');
const { Op } = require('sequelize');

class NavigationLogsRepository extends BaseRepository {
	constructor() {
		super(db.NavigationLog, { sortableFields: ['recorded_at', 'update_id'] });
	}

	buildWhere(filter = {}) {
		const where = {};
		const { update_id, bus_id, trip_id, from, to } = filter;
		if (update_id) where.update_id = update_id;
		if (bus_id) where.bus_id = bus_id;
		if (trip_id) where.trip_id = trip_id;
		if (from || to) {
			where.recorded_at = {};
			if (from) where.recorded_at[Op.gte] = new Date(from);
			if (to) where.recorded_at[Op.lte] = new Date(to);
		}
		return where;
	}
}

module.exports = new NavigationLogsRepository();
