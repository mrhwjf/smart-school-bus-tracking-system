const repo = require('../repositories/driversRepository');
const createHttpError = require('../utils/httpError');

module.exports = {
	async list() {
		return repo.findAll();
	},

	async get(id) {
		const item = await repo.findById(id);
		if (!item) throw createHttpError(404, 'Driver not found');
		return item;
	},

	async create(payload) {
		const { driver_id, license_number, vehicle_permit } = payload;
		if (!license_number) throw createHttpError(400, 'license_number is required');
		try {
			return await repo.create({ driver_id, license_number, vehicle_permit });
		} catch (err) {
			if (err.name === 'SequelizeUniqueConstraintError') {
				throw createHttpError(409, 'license_number must be unique');
			}
			throw err;
		}
	},

	async update(id, payload) {
		const updated = await repo.update(id, payload);
		if (!updated) throw createHttpError(404, 'Driver not found');
		return updated;
	},

	async remove(id) {
		const deleted = await repo.remove(id);
		if (!deleted) throw createHttpError(404, 'Driver not found');
	}
};
