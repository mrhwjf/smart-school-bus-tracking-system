const db = require('../models');

module.exports = {
	findAll(options = {}) { return db.Role.findAll({ order: [['role_id', 'ASC']], ...options }); },
	findById(id, options = {}) { return db.Role.findByPk(id, options); },
	create(data) { return db.Role.create(data); },
	async update(id, data) { const [c] = await db.Role.update(data, { where: { role_id: id } }); if (!c) return null; return this.findById(id); },
	remove(id) { return db.Role.destroy({ where: { role_id: id } }); }
};
