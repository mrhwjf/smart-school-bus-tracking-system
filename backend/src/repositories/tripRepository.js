const { Trip, RoutePassenger } = require('../models');

// Trips
const TRIP_PK = 'trip_id';

async function findById(id, options = {}) {
	return Trip.findByPk(id, options);
}

async function findOne(where = {}, options = {}) {
	return Trip.findOne({ where, ...options });
}

async function list({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const order = sort
		? [[sort.field, sort.direction === 'DESC' ? 'DESC' : 'ASC']]
		: undefined;

	const limit = pageSize;
	const offset = page * pageSize;

	const { rows, count } = await Trip.findAndCountAll({
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

async function create(data, options = {}) {
	return Trip.create(data, options);
}

async function bulkCreate(listData = [], options = {}) {
	return Trip.bulkCreate(listData, { validate: true, ...options });
}

async function updateById(id, changes, options = {}) {
	await Trip.update(changes, { where: { [TRIP_PK]: id }, ...options });
	return findById(id, options);
}

async function deleteById(id, options = {}) {
	return Trip.destroy({ where: { [TRIP_PK]: id }, ...options });
}

async function bulkDelete(where = {}, options = {}) {
	return Trip.destroy({ where, ...options });
}

module.exports = {
	// Trips
	findById,
	findOne,
	list,
	create,
	bulkCreate,
	updateById,
	deleteById,
	bulkDelete,
};
