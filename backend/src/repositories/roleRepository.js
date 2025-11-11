const { Role } = require('../models');

const PK = 'role_id';

async function findById(id, options = {}) {
	return Role.findByPk(id, options);
}

async function findOne(where = {}, options = {}) {
	return Role.findOne({ where, ...options });
}

async function list({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const order = sort ? [[sort.field, sort.direction === 'DESC' ? 'DESC' : 'ASC']] : undefined;
	const limit = pageSize;
	const offset = page * pageSize;
	const { rows, count } = await Role.findAndCountAll({
		where: filter,
		order,
		limit,
		offset,
		...options
	});
	const totalPages = pageSize ? Math.ceil(count / pageSize) : 0;
	return { rows, count, page, pageSize, totalPages };
}

async function create(data, options = {}) {
	return Role.create(data, options);
}

async function bulkCreate(listData = [], options = {}) {
	return Role.bulkCreate(listData, { validate: true, ...options });
}

async function updateById(id, changes, options = {}) {
	await Role.update(changes, { where: { [PK]: id }, ...options });
	return findById(id, options);
}

async function deleteById(id, options = {}) {
	return Role.destroy({ where: { [PK]: id }, ...options });
}

async function bulkDelete(where = {}, options = {}) {
	return Role.destroy({ where, ...options });
}

module.exports = {
	findById,
	findOne,
	list,
	create,
	bulkCreate,
	updateById,
	deleteById,
	bulkDelete,
};
