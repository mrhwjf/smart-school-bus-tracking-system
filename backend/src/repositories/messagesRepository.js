const db = require('../models');

module.exports = {
	findAll(options = {}) { return db.Message.findAll({ order: [['message_id', 'ASC']], ...options }); },
	findById(id, options = {}) { return db.Message.findByPk(id, options); },
	create(data) { return db.Message.create(data); },
	async update(id, data) { const [c] = await db.Message.update(data, { where: { message_id: id } }); if (!c) return null; return this.findById(id); },
	remove(id) { return db.Message.destroy({ where: { message_id: id } }); }
};
