const { Stop } = require('../models');
const { Op } = require('sequelize');

const PK = 'stop_id';

async function findById(id, options = {}) {
	return Stop.findByPk(id, options);
}

async function findOne(where = {}, options = {}) {
	return Stop.findOne({ where, ...options });
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

	const where = { ...filter };
	if (filter.name) {
		where.name = { [Op.like]: `%${String(filter.name).trim()}%` };
	}
	if (filter.address) {
		where.address = { [Op.like]: `%${String(filter.address).trim()}%` };
	}

	const { rows, count } = await Stop.findAndCountAll({
		where,
		order,
		limit,
		offset,
		...options,
	});

	const totalPages = pageSize ? Math.ceil(count / pageSize) : 0;
	return { rows, count, page, pageSize, totalPages };
}

async function create(data, options = {}) {
	return Stop.create(data, options);
}

async function bulkCreate(listData = [], options = {}) {
	return Stop.bulkCreate(listData, { validate: true, ...options });
}

async function updateById(id, changes, options = {}) {
	await Stop.update(changes, { where: { [PK]: id }, ...options });
	return findById(id, options);
}

async function deleteById(id, options = {}) {
	return Stop.destroy({ where: { [PK]: id }, ...options });
}

async function bulkDelete(where = {}, options = {}) {
	return Stop.destroy({ where, ...options });
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
