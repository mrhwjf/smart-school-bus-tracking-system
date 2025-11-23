const apiResponse = require('../utils/apiResponse');
const createPagination = require('../utils/pagination');
const { toScheduleDto } = require('../dtos');
const { ScheduleRepository, BusRepository } = require('../repositories');
const { sequelize } = require('../models');

// Schedules
async function listSchedules({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await ScheduleRepository.list({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toScheduleDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('Schedules fetched successfully', data);
}

async function getScheduleById(scheduleId, options = {}) {
	const schedule = await ScheduleRepository.findById(scheduleId, options);
	if (!schedule) return apiResponse.failure('Schedule not found');
	return apiResponse.success('Schedule fetched successfully', toScheduleDto(schedule));
}

async function createSchedule(data, options = {}) {
	// Optional guard: only ACTIVE buses
	if (data.busId) {
		const bus = await BusRepository.findById(data.busId);
		if (!bus || (bus.status && bus.status !== 'ACTIVE')) {
			return apiResponse.failure('Bus must be ACTIVE to assign to a schedule');
		}
	}
	return sequelize.transaction(async (t) => {
		const created = await ScheduleRepository.create({
			route_id: data.routeId,
			bus_id: data.busId,
			driver_id: data.driverId,
			shift: data.shift,
			start_time: data.startTime,
			end_time: data.endTime,
			active: data.active,
		}, { transaction: t });
		// Attach days if provided
		if (Array.isArray(data.days)) {
			await ScheduleRepository.replaceScheduleDays(created.schedule_id, data.days, { transaction: t });
		}
		const full = await ScheduleRepository.findById(created.schedule_id, { transaction: t });
		return apiResponse.success('Schedule created successfully', toScheduleDto(full));
	});
}

async function updateSchedule(scheduleId, changes, options = {}) {
	if (changes.busId) {
		const bus = await BusRepository.findById(changes.busId);
		if (!bus || (bus.status && bus.status !== 'ACTIVE')) {
			return apiResponse.failure('Bus must be ACTIVE to assign to a schedule');
		}
	}
	return sequelize.transaction(async (t) => {
		const updated = await ScheduleRepository.updateById(scheduleId, {
			route_id: changes.routeId,
			bus_id: changes.busId,
			driver_id: changes.driverId,
			shift: changes.shift,
			start_time: changes.startTime,
			end_time: changes.endTime,
			active: changes.active,
		}, { transaction: t });
		if (!updated) return apiResponse.failure('Schedule not found');
		if (Array.isArray(changes.days)) {
			await ScheduleRepository.replaceScheduleDays(scheduleId, changes.days, { transaction: t });
		}
		const full = await ScheduleRepository.findById(scheduleId, { transaction: t });
		return apiResponse.success('Schedule updated successfully', toScheduleDto(full));
	});
}

async function deleteSchedule(scheduleId, options = {}) {
	const deleted = await ScheduleRepository.deleteById(scheduleId, options);
	return apiResponse.success('Schedule deleted successfully', { deleted });
}

// Days management
async function getScheduleDays(scheduleId, options = {}) {
	const days = await ScheduleRepository.getScheduleDays(scheduleId, options);
	const items = days.map(d => d.day_of_week);
	return apiResponse.success('Schedule days fetched successfully', items);
}

async function replaceScheduleDays(scheduleId, days = []) {
	return sequelize.transaction(async (t) => {
		const replaced = await ScheduleRepository.replaceScheduleDays(scheduleId, days, { transaction: t });
		const items = replaced.map(d => d.day_of_week);
		return apiResponse.success('Schedule days replaced successfully', items);
	});
}

module.exports = {
	// Schedules
	listSchedules, getScheduleById, createSchedule, updateSchedule, deleteSchedule,
	getScheduleDays, replaceScheduleDays,
};
