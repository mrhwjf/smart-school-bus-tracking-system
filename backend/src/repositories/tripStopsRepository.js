const BaseRepository = require('./baseRepository');
const db = require('../models');

class TripStopsRepository extends BaseRepository {
	constructor() {
		super(db.TripStop, { sortableFields: ['stop_order'] });
		this.primaryKey = undefined; // composite handled via object key
	}

	buildWhere(filter = {}) {
		const where = {};
		const { trip_id, stop_id, stop_order } = filter;
		if (trip_id) where.trip_id = trip_id;
		if (stop_id) where.stop_id = stop_id;
		if (stop_order != null) where.stop_order = stop_order;
		return where;
	}
}

module.exports = new TripStopsRepository();
