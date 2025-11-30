const { Student } = require('../models');
const { Op } = require('sequelize');

const PK = 'student_id';

async function findById(id, options = {}) {
	// Include basic associations for common access patterns
	return Student.scope('withClass', 'withParent').findByPk(id, options);
}

async function findOne(where = {}, options = {}) {
	return Student.scope('withClass', 'withParent').findOne({ where, ...options });
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

	// Flexible where conditions
	const where = { ...filter };
	if (filter.name) {
		where.name = { [Op.like]: `%${String(filter.name).trim()}%` };
	}

	const { rows, count } = await Student.scope('withClass', 'withParent').findAndCountAll({
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
	return Student.create(data, options);
}

async function bulkCreate(listData = [], options = {}) {
	return Student.bulkCreate(listData, { validate: true, ...options });
}

async function updateById(id, changes, options = {}) {
	await Student.update(changes, { where: { [PK]: id }, ...options });
	return findById(id, options);
}

async function deleteById(id, options = {}) {
	return Student.destroy({ where: { [PK]: id }, ...options });
}

async function bulkDelete(where = {}, options = {}) {
	return Student.destroy({ where, ...options });
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
