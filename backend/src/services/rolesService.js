const repo = require('../repositories/rolesRepository');
const createHttpError = require('../utils/httpError');

module.exports = {
	list() { return repo.findAll(); },
	async get(id) { const r = await repo.findById(id); if (!r) throw createHttpError(404, 'Role not found'); return r; },
	async create(payload) {
		const { name, description } = payload;
		if (!name) throw createHttpError(400, 'name is required');
		try { return await repo.create({ name, description }); } catch (err) {
			if (err.name === 'SequelizeUniqueConstraintError') throw createHttpError(409, 'Role name must be unique');
			throw err;
		}
	},
	async update(id, payload) {
		const updated = await repo.update(id, payload);
		if (!updated) throw createHttpError(404, 'Role not found');
		return updated;
	},
	async remove(id) { const deleted = await repo.remove(id); if (!deleted) throw createHttpError(404, 'Role not found'); }
};
