const db = require('../models');

module.exports = {
	async findAll(options = {}) {
		return db.Bus.findAll({ order: [['bus_id', 'ASC']], ...options });
	},

	async findById(bus_id, options = {}) {
		return db.Bus.findByPk(bus_id, options);
	},

	async create(data) {
		return db.Bus.create(data);
	},

	async update(bus_id, data) {
		const [count] = await db.Bus.update(data, { where: { bus_id } });
		if (count === 0) return null;
		return this.findById(bus_id);
	},

	async remove(bus_id) {
		return db.Bus.destroy({ where: { bus_id } });
	}
};
