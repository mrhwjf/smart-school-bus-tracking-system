const repo = require('../repositories/busesRepository');
const createHttpError = require('../utils/httpError');

module.exports = {
	async list() {
		return repo.findAll();
	},

	async get(id) {
		const item = await repo.findById(id);
		if (!item) throw createHttpError(404, 'Bus not found');
		return item;
	},

	async create(payload) {
		const { plate_number, driver_id, model, status, capacity } = payload;
		if (!plate_number) throw createHttpError(400, 'plate_number is required');
		try {
			return await repo.create({ plate_number, driver_id, model, status, capacity });
		} catch (err) {
			if (err.name === 'SequelizeUniqueConstraintError') {
				throw createHttpError(409, 'plate_number must be unique');
			}
			throw err;
		}
	},

	async update(id, payload) {
		const updated = await repo.update(id, payload);
		if (!updated) throw createHttpError(404, 'Bus not found');
		return updated;
	},

	async remove(id) {
		const deleted = await repo.remove(id);
		if (!deleted) throw createHttpError(404, 'Bus not found');
	}
};
