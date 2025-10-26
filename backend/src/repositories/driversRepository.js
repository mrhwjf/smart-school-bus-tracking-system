const BaseRepository = require('./baseRepository');
const db = require('../models');

class DriversRepository extends BaseRepository {
	constructor() {
		super(db.Driver, { sortableFields: ['created_at', 'driver_id', 'license_number'] });
	}

	buildWhere(filter = {}) {
		const where = {};
		const { driver_id, license_number, vehicle_permit } = filter;
		if (driver_id) where.driver_id = driver_id;
		if (license_number) where.license_number = license_number;
		if (vehicle_permit) where.vehicle_permit = vehicle_permit;
		return where;
	}
}

module.exports = new DriversRepository();
