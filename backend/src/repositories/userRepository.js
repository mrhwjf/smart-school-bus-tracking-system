const { User } = require('../models');

// Users
const USER_PK = 'user_id';

async function findById(id, options = {}) {
	return User.scope('withFullDetails').findByPk(id, options);
}

async function findOne(where = {}, options = {}) {
	return User.scope('withFullDetails').findOne({ where, ...options });
}

async function list(
	{ filter = {}, sort, page = 0, pageSize = 10 } = {},
	options = {},
) {
	const order = sort
		? [[sort.field, sort.direction === 'DESC' ? 'DESC' : 'ASC']]
		: undefined;

	const limit = pageSize;
	const offset = page * pageSize;

	const { rows, count } = await User.scope('withRole').findAndCountAll({
		where: filter,
		order,
		limit,
		offset,
		...options,
	});

	const totalPages = pageSize ? Math.ceil(count / pageSize) : 0;

	return {
		rows,
		count,
		page,
		pageSize,
		totalPages,
	};
}

async function listParentsForDropdown(options = {}) {
	const { rows } = await User.scope('withParent').findAndCountAll({
		...options,
	});
	return { rows };
}

async function listDriversForDropdown(options = {}) {
	const { rows } = await User.scope('withDriver').findAndCountAll({
		...options,
	});
	return { rows };
}

async function create(data, options = {}) {
	return User.create(data, options);
}

async function bulkCreate(list = [], options = {}) {
	return User.bulkCreate(list, { validate: true, ...options });
}

async function updateById(id, changes, options = {}) {
	await User.update(changes, { where: { [USER_PK]: id }, ...options });
	return findById(id, options);
}

async function deleteById(id, options = {}) {
	return User.destroy({ where: { [USER_PK]: id }, ...options });
}

async function bulkDelete(where = {}, options = {}) {
	return User.destroy({ where, ...options });
}

async function lockById(id, locked, options = {}) {
	return User.update({ locked }, { where: { [USER_PK]: id }, ...options });
}

async function isLocked(id, options = {}) {
	const user = await User.findByPk(id, { attributes: ['locked'], ...options });
	return user ? user.locked : null;
}


module.exports = {
	// Users
	findById,
	findOne,
	list,
	listParentsForDropdown,
	listDriversForDropdown,
	create,
	bulkCreate,
	updateById,
	deleteById,
	bulkDelete,
	lockById,
	isLocked
};
