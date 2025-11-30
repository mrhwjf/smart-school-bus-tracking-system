const apiResponse = require('../utils/apiResponse');
const createPagination = require('../utils/pagination');
const { toStopDto } = require('../dtos');
const { StopRepository } = require('../repositories');

async function listStops({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await StopRepository.list({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toStopDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('Stops fetched successfully', data);
}

async function getStopById(stopId, options = {}) {
	const stop = await StopRepository.findById(stopId, options);
	if (!stop) return apiResponse.failure('Stop not found');
	return apiResponse.success('Stop fetched successfully', toStopDto(stop));
}

async function createStop(data, options = {}) {
	const created = await StopRepository.create({
		name: data.name,
		latitude: data.latitude,
		longitude: data.longitude,
		address: data.address,
		active: data.active,
	}, options);
	return apiResponse.success('Stop created successfully', toStopDto(created));
}

async function updateStop(stopId, changes, options = {}) {
	const updated = await StopRepository.updateById(stopId, {
		name: changes.name,
		latitude: changes.latitude,
		longitude: changes.longitude,
		address: changes.address,
		active: changes.active,
	}, options);
	return apiResponse.success('Stop updated successfully', toStopDto(updated));
}

async function deleteStop(stopId, options = {}) {
	const deleted = await StopRepository.deleteById(stopId, options);
	return apiResponse.success('Stop deleted successfully', { deleted });
}

module.exports = {
	listStops,
	getStopById,
	createStop,
	updateStop,
	deleteStop,
};