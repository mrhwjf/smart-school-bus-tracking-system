const db = require('../models');

module.exports = {
	findAll(options = {}) { return db.User.findAll({ order: [['user_id', 'ASC']], ...options }); },
	findById(id, options = {}) { return db.User.findByPk(id, options); },
	findByEmail(email) { return db.User.findOne({ where: { email } }); },
	create(data) { return db.User.create(data); },
	async update(id, data) {
		const [count] = await db.User.update(data, { where: { user_id: id } });
		if (!count) return null; return this.findById(id);
	},
	remove(id) { return db.User.destroy({ where: { user_id: id } }); }
};
