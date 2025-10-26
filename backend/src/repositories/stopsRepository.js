const BaseRepository = require('./baseRepository');
const db = require('../models');
const { Op } = require('sequelize');

class StopsRepository extends BaseRepository {
	constructor() {
		super(db.Stop, { sortableFields: ['created_at', 'updated_at', 'stop_id', 'seq_index', 'name'] });
	}

	buildWhere(filter = {}) {
		const where = {};
		const { stop_id, route_id, name, address, minSeq, maxSeq, q } = filter;
		if (stop_id) where.stop_id = stop_id;
		if (route_id) where.route_id = route_id;
		if (name) where.name = name;
		if (address) where.address = address;
		if (minSeq != null || maxSeq != null) {
			where.seq_index = {};
			if (minSeq != null) where.seq_index[Op.gte] = Number(minSeq);
			if (maxSeq != null) where.seq_index[Op.lte] = Number(maxSeq);
		}
		if (q) {
			where[Op.or] = [
				{ name: { [Op.like]: `%${q}%` } },
				{ address: { [Op.like]: `%${q}%` } },
			];
		}
		return where;
	}
}

module.exports = new StopsRepository();
