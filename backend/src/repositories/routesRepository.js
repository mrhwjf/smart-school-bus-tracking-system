const BaseRepository = require('./baseRepository');
const db = require('../models');
const { Op } = require('sequelize');

class RoutesRepository extends BaseRepository {
	constructor() {
		super(db.Route, { sortableFields: ['created_at', 'updated_at', 'route_id', 'name'] });
	}

	buildWhere(filter = {}) {
		const where = {};
		const { route_id, name, q } = filter;
		if (route_id) where.route_id = route_id;
		if (name) where.name = name;
		if (q) where.name = { [Op.like]: `%${q}%` };
		return where;
	}
}

module.exports = new RoutesRepository();
