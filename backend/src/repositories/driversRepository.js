const db = require('../models');

module.exports = {
	async findAll(options = {}) {
		return db.Driver.findAll({ order: [['driver_id', 'ASC']], ...options });
	},

	async findById(driver_id, options = {}) {
		return db.Driver.findByPk(driver_id, options);
	},

	async create(data) {
		return db.Driver.create(data);
	},

	async update(driver_id, data) {
		const [count] = await db.Driver.update(data, { where: { driver_id } });
		if (count === 0) return null;
		return this.findById(driver_id);
	},

	async remove(driver_id) {
		return db.Driver.destroy({ where: { driver_id } });
	}
};
