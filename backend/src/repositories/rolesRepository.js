const BaseRepository = require('./baseRepository');
const db = require('../models');

class RolesRepository extends BaseRepository {
	constructor() {
		super(db.Role, { sortableFields: ['created_at', 'updated_at', 'role_id', 'name'] });
	}

	buildWhere(filter = {}) {
		const where = {};
		const { role_id, name } = filter;
		if (role_id) where.role_id = role_id;
		if (name) where.name = name;
		return where;
	}
}

module.exports = new RolesRepository();
