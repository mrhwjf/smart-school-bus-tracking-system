const { Op } = require('sequelize');
const BaseRepository = require('./baseRepository');
const db = require('../models');

class UsersRepository extends BaseRepository {
	constructor() {
		super(db.User, { sortableFields: ['created_at', 'updated_at', 'user_id', 'name', 'email'] });
	}

	buildWhere(filter = {}) {
		const where = {};
		const { user_id, role_id, email, phone_number, locked, name, q } = filter;
		if (user_id) where.user_id = user_id;
		if (role_id) where.role_id = role_id;
		if (email) where.email = email;
		if (phone_number) where.phone_number = phone_number;
		if (typeof locked === 'boolean') where.locked = locked;
		if (name) where.name = name;
		if (q) {
			where[Op.or] = [
				{ name: { [Op.like]: `%${q}%` } },
				{ email: { [Op.like]: `%${q}%` } },
				{ phone_number: { [Op.like]: `%${q}%` } },
			];
		}
		return where;
	}
}

module.exports = new UsersRepository();
