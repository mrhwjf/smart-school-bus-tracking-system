const apiResponse = require('../utils/apiResponse');
const createPagination = require('../utils/pagination');
const { toBusDto } = require('../dtos');
const { BusRepository } = require('../repositories');


// Buses
async function listBuses({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await BusRepository.list({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toBusDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('Buses fetched successfully', data);
}
async function getBusById(busId, options = {}) {
	const bus = await BusRepository.findById(busId, options);
	if (!bus) return apiResponse.failure('Bus not found');
	return apiResponse.success('Bus fetched successfully', toBusDto(bus));
}
async function createBus(data, options = {}) {
	const created = await BusRepository.create({
		plate_number: data.plateNumber,
		model: data.model,
		status: data.status,
		capacity: data.capacity,
	}, options);
	return apiResponse.success('Bus created successfully', toBusDto(created));
}
async function updateBus(busId, changes, options = {}) {
	const updated = await BusRepository.updateById(busId, {
		plate_number: changes.plateNumber,
		model: changes.model,
		status: changes.status,
		capacity: changes.capacity,
	}, options);
	if (!updated) return apiResponse.failure('Bus not found');
	return apiResponse.success('Bus updated successfully', toBusDto(updated));
}
async function deleteBus(busId, options = {}) {
	const deleted = await BusRepository.deleteById(busId, options);
	return apiResponse.success('Bus deleted successfully', { deleted });
}

module.exports = {
	listBuses,
	getBusById,
	createBus,
	updateBus,
	deleteBus
};