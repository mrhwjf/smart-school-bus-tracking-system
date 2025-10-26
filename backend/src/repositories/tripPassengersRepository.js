const BaseRepository = require('./baseRepository');
const db = require('../models');

class TripPassengersRepository extends BaseRepository {
	constructor() {
		super(db.TripPassenger, { sortableFields: ['trip_id', 'student_id'] });
		this.primaryKey = undefined; // composite handled via object key
	}

	buildWhere(filter = {}) {
		const where = {};
		const { trip_id, student_id } = filter;
		if (trip_id) where.trip_id = trip_id;
		if (student_id) where.student_id = student_id;
		return where;
	}
}

module.exports = new TripPassengersRepository();
