const BaseRepository = require('./baseRepository');
const db = require('../models');

class ParentsRepository extends BaseRepository {
	constructor() {
		super(db.Parent, { sortableFields: ['created_at', 'parent_id'] });
	}

	buildWhere(filter = {}) {
		const where = {};
		const { parent_id, relationship } = filter;
		if (parent_id) where.parent_id = parent_id;
		if (relationship) where.relationship = relationship;
		return where;
	}
}

module.exports = new ParentsRepository();
