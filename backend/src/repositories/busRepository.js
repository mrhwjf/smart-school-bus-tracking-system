const { Bus } = require('../models');
const { Op } = require('sequelize');

const PK = 'bus_id';

async function findById(id, options = {}) {
	return Bus.findByPk(id, options);
}

async function findOne(where = {}, options = {}) {
	return Bus.findOne({ where, ...options });
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
	if (filter.plate_number) {
		where.plate_number = { [Op.like]: `%${String(filter.plate_number).trim()}%` };
	}
	if (filter.model) {
		where.model = { [Op.like]: `%${String(filter.model).trim()}%` };
	}

	const { rows, count } = await Bus.findAndCountAll({
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
	return Bus.create(data, options);
}

async function bulkCreate(listData = [], options = {}) {
	return Bus.bulkCreate(listData, { validate: true, ...options });
}

async function updateById(id, changes, options = {}) {
	await Bus.update(changes, { where: { [PK]: id }, ...options });
	return findById(id, options);
}

async function deleteById(id, options = {}) {
	return Bus.destroy({ where: { [PK]: id }, ...options });
}

async function bulkDelete(where = {}, options = {}) {
	return Bus.destroy({ where, ...options });
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
