const { Route, RouteStop, RoutePassenger, Student } = require('../models');
const { Op } = require('sequelize');

const PK = 'route_id';

async function findById(id, options = {}) {
	return Route.scope('withOrderedStopsAndStudents').findByPk(id, options);
}

async function findOne(where = {}, options = {}) {
	return Route.scope('withOrderedStopsAndStudents').findOne({ where, ...options });
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

	const { rows, count } = await Route.findAndCountAll({
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
	return Route.scope('withOrderedStopsAndStudents').create(data, options);
}

async function bulkCreate(listData = [], options = {}) {
	return Route.bulkCreate(listData, { validate: true, ...options });
}

async function updateById(id, changes, options = {}) {
	await Route.update(changes, { where: { [PK]: id }, ...options });
	return findById(id, options);
}

async function deleteById(id, options = {}) {
	return Route.destroy({ where: { [PK]: id }, ...options });
}

async function bulkDelete(where = {}, options = {}) {
	return Route.destroy({ where, ...options });
}

// ----- Route Stops management -----
async function getRouteStops(routeId, options = {}) {
	return RouteStop.findAll({
		where: { route_id: routeId },
		order: [['stop_order', 'ASC']],
		// include: [{ model: Stop }],
		...options,
	});
}

async function replaceRouteStops(routeId, stops = [], options = {}) {
	const { transaction } = options;
	// Clear existing
	await RouteStop.destroy({ where: { route_id: routeId }, transaction });
	if (!stops || stops.length === 0) return [];
	const rows = stops.map((s, index) => ({
		route_id: routeId,
		stop_id: s.stopId || s.stop_id,
		stop_order: typeof s.stopOrder === 'number' ? s.stopOrder : (s.stopOrder != null ? Number(s.stopOrder) : index),
	}));
	await RouteStop.bulkCreate(rows, { validate: true, transaction });
	return getRouteStops(routeId, { transaction });
}

// ----- Route Passengers management -----
async function getRoutePassengers(routeId, options = {}) {
	return RoutePassenger.scope('withStudentAndStop').findAll({
		where: { route_id: routeId },
		...options,
	});
}

async function replaceRoutePassengersForStop(routeId, stopId, studentIds = [], options = {}) {
	const { transaction } = options;

	// Remove existing passengers for this stop
	await RoutePassenger.destroy({
		where: { route_id: routeId, stop_id: stopId },
		transaction,
	});

	if (!studentIds || studentIds.length === 0) return [];

	// Bulk insert new passengers
	const rows = studentIds.map(student_id => ({ route_id: routeId, stop_id: stopId, student_id }));
	await RoutePassenger.bulkCreate(rows, { validate: true, transaction });

	// Return inserted passengers
	return RoutePassenger.findAll({
		where: { route_id: routeId, stop_id: stopId },
		transaction,
	});
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
	getRouteStops,
	replaceRouteStops,
	getRoutePassengers,
	replaceRoutePassengersForStop,
};
