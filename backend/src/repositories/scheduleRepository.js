const { Schedule, ScheduleDay } = require('../models');
const { Op } = require('sequelize');

const PK = 'schedule_id';

async function findById(id, options = {}) {
	return Schedule.scope('withFullDetails').findByPk(id, options);
}

async function findOne(where = {}, options = {}) {
	return Schedule.scope('withFullDetails').findOne({ where, ...options });
}

async function list(
	{ filter = {}, sort, page = 0, pageSize = 10 } = {},
	options = {}
) {
	const order = sort
		? [[sort.field, sort.direction === 'DESC' ? 'DESC' : 'ASC']]
		: undefined;

	const where = { ...filter };
	// Optional filter normalization (none LIKE-based for now)

	const { count, rows } = await Schedule.findAndCountAll({
		where,
		order,
		limit: pageSize,
		offset: page * pageSize,
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
	return Schedule.create(data, options);
}

async function bulkCreate(listData = [], options = {}) {
	return Schedule.bulkCreate(listData, { validate: true, ...options });
}

async function updateById(id, changes, options = {}) {
	await Schedule.update(changes, { where: { [PK]: id }, ...options });
	return findById(id, options);
}

async function deleteById(id, options = {}) {
	return Schedule.destroy({ where: { [PK]: id }, ...options });
}

async function bulkDelete(where = {}, options = {}) {
	return Schedule.destroy({ where, ...options });
}

async function setActivebyId(id, active, options = {}) {
	return Schedule.update(
		{ active },
		{ where: { [PK]: id }, ...options }
	);
}

// ----- Schedule Days management -----
async function getScheduleDays(scheduleId, options = {}) {
	return ScheduleDay.findAll({ where: { schedule_id: scheduleId }, ...options });
}

async function replaceScheduleDays(scheduleId, days = [], options = {}) {
	const { transaction } = options;
	await ScheduleDay.destroy({ where: { schedule_id: scheduleId }, transaction });
	if (!Array.isArray(days) || days.length === 0) return [];
	const rows = days.map(d => ({ schedule_id: scheduleId, day_of_week: d }));
	await ScheduleDay.bulkCreate(rows, { validate: true, transaction });
	return getScheduleDays(scheduleId, { transaction });
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
	setActivebyId,
	getScheduleDays,
	replaceScheduleDays,
};
