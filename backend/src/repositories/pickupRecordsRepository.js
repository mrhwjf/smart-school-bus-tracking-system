const BaseRepository = require('./baseRepository');
const db = require('../models');
const { Op } = require('sequelize');

class PickupRecordsRepository extends BaseRepository {
	constructor() {
		super(db.PickupRecord, { sortableFields: ['recorded_at', 'record_id'] });
	}

	buildWhere(filter = {}) {
		const where = {};
		const { record_id, student_id, stop_id, trip_id, status, from, to } = filter;
		if (record_id) where.record_id = record_id;
		if (student_id) where.student_id = student_id;
		if (stop_id) where.stop_id = stop_id;
		if (trip_id) where.trip_id = trip_id;
		if (status) where.status = status;
		if (from || to) {
			where.recorded_at = {};
			if (from) where.recorded_at[Op.gte] = new Date(from);
			if (to) where.recorded_at[Op.lte] = new Date(to);
		}
		return where;
	}
}

module.exports = new PickupRecordsRepository();
