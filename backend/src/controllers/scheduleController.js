const { scheduleService } = require('../services');
// Schedule
async function listSchedules(req, res, next) {
	try {
		const { page = 0, size = 10, routeId, busId, driverId, shift, active, sortField, sortDirection } = req.query;
		const filter = {};
		if (routeId) filter.route_id = Number(routeId);
		if (busId) filter.bus_id = Number(busId);
		if (driverId) filter.driver_id = Number(driverId);
		if (shift) filter.shift = String(shift);
		if (typeof active === 'boolean') filter.active = active;
		const allowedSortFields = ['schedule_id', 'start_time', 'created_at'];
		const sort = sortField && allowedSortFields.includes(sortField)
			? { field: sortField, direction: sortDirection === 'DESC' ? 'DESC' : 'ASC' }
			: undefined;
		const result = await scheduleService.listSchedules({ filter, sort, page: Number(page), pageSize: Number(size) });
		res.json(result);
	} catch (err) { next(err); }
}

async function getSchedule(req, res, next) {
	try {
		const { scheduleId } = req.params;
		const result = await scheduleService.getScheduleById(Number(scheduleId));
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function createSchedule(req, res, next) {
	try {
		const result = await scheduleService.createSchedule(req.body);
		res.status(201).json(result);
	} catch (err) { next(err); }
}

async function updateSchedule(req, res, next) {
	try {
		const { scheduleId } = req.params;
		const result = await scheduleService.updateSchedule(Number(scheduleId), req.body);
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function deleteSchedule(req, res, next) {
	try {
		const { scheduleId } = req.params;
		const result = await scheduleService.deleteSchedule(Number(scheduleId));
		res.json(result);
	} catch (err) { next(err); }
}

// Days management
async function getScheduleDays(req, res, next) {
	try {
		const { scheduleId } = req.params;
		const result = await scheduleService.getScheduleDays(Number(scheduleId));
		res.json(result);
	} catch (err) { next(err); }
}

async function replaceScheduleDays(req, res, next) {
	try {
		const { scheduleId } = req.params;
		const { days = [] } = req.body || {};
		const result = await scheduleService.replaceScheduleDays(Number(scheduleId), days);
		res.json(result);
	} catch (err) { next(err); }
}

module.exports = {
	listSchedules, getSchedule, createSchedule, updateSchedule, deleteSchedule,
	getScheduleDays, replaceScheduleDays,
};
