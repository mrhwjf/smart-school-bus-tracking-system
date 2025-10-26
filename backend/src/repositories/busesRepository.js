const BaseRepository = require('./baseRepository');
const db = require('../models');

class BusesRepository extends BaseRepository {
	constructor() {
		super(db.Bus, { sortableFields: ['created_at', 'updated_at', 'bus_id', 'plate_number', 'status', 'capacity'] });
	}

	buildWhere(filter = {}) {
		const where = {};
		const { bus_id, driver_id, plate_number, status, capacity } = filter;
		if (bus_id) where.bus_id = bus_id;
		if (driver_id) where.driver_id = driver_id;
		if (plate_number) where.plate_number = plate_number;
		if (status) where.status = status;
		if (capacity != null) where.capacity = capacity;
		return where;
	}
}

module.exports = new BusesRepository();
