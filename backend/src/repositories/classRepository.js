const { Class } = require('../models');

const PK = 'class_id';

async function findById(id, options = {}) {
	return Class.findByPk(id, options);
}

async function findOne(where = {}, options = {}) {
	return Class.findOne({ where, ...options });
}

async function list(
	{ filter = {}, sort, page = 0, pageSize = 10 } = {},
	options = {}
) {
	const order = sort
		? [[sort.field, sort.direction === 'DESC' ? 'DESC' : 'ASC']]
		: undefined;

	const limit = pageSize;
	const offset = page * pageSize;

	const { rows, count } = await Class.findAndCountAll({
		where: filter,
		order,
		limit,
		offset,
		...options,
	});

	const totalPages = pageSize ? Math.ceil(count / pageSize) : 0;
	return { rows, count, page, pageSize, totalPages };
}

async function create(data, options = {}) {
	return Class.create(data, options);
}

async function bulkCreate(listData = [], options = {}) {
	return Class.bulkCreate(listData, { validate: true, ...options });
}

async function updateById(id, changes, options = {}) {
	await Class.update(changes, { where: { [PK]: id }, ...options });
	return findById(id, options);
}

async function deleteById(id, options = {}) {
	return Class.destroy({ where: { [PK]: id }, ...options });
}

async function bulkDelete(where = {}, options = {}) {
	return Class.destroy({ where, ...options });
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
