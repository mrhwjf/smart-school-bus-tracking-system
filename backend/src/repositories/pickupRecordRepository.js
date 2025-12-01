const { PickupRecord } = require('../models');

const PK = 'record_id';

async function findById(id, options = {}) {
	return PickupRecord.findByPk(id, options);
}

async function findOne(where = {}, options = {}) {
	return PickupRecord.findOne({ where, ...options });
}

async function list(
	{ filter = {}, sort, page = 0, pageSize = 10 } = {},
	options = {}
) {
	const order = sort
		? [[sort.field, sort.direction === 'DESC' ? 'DESC' : 'ASC']]
		: [['recorded_at', 'DESC']];

	const limit = pageSize;
	const offset = page * pageSize;

	const { rows, count } = await PickupRecord.scope('withDetails').findAndCountAll({
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
	return PickupRecord.create(data, options);
}

async function bulkCreate(listData = [], options = {}) {
	return PickupRecord.bulkCreate(listData, { validate: true, ...options });
}

async function updateById(id, changes, options = {}) {
	await PickupRecord.update(changes, { where: { [PK]: id }, ...options });
	return findById(id, options);
}

async function deleteById(id, options = {}) {
	return PickupRecord.destroy({ where: { [PK]: id }, ...options });
}

async function bulkDelete(where = {}, options = {}) {
	return PickupRecord.destroy({ where, ...options });
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
