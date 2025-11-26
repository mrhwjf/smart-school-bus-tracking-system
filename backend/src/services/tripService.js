const apiResponse = require('../utils/apiResponse');
const createPagination = require('../utils/pagination');
const {
	toTripDto,
	toPickupRecordDto,
} = require('../dtos');

const {
	TripRepository,
	PickupRecordRepository,
} = require('../repositories');

// Trips
async function listTrips({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await TripRepository.list({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toTripDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('Trips fetched successfully', data);
}

async function getTripById(tripId, options = {}) {
	const trip = await TripRepository.findById(tripId, options);
	if (!trip) return apiResponse.failure('Trip not found');
	return apiResponse.success('Trip fetched successfully', toTripDto(trip));
}

async function createTrip(data, options = {}) {
	const created = await TripRepository.create({
		schedule_id: data.scheduleId,
		trip_date: data.tripDate,
		driver_id: data.driverId,
		actual_start_time: data.actualStartTime,
		actual_end_time: data.actualEndTime,
		status: data.status,
	}, options);
	return apiResponse.success('Trip created successfully', toTripDto(created));
}

async function updateTrip(tripId, changes, options = {}) {
	const updated = await TripRepository.updateById(tripId, {
		schedule_id: changes.scheduleId,
		trip_date: changes.tripDate,
		driver_id: changes.driverId,
		actual_start_time: changes.actualStartTime,
		actual_end_time: changes.actualEndTime,
		status: changes.status,
	}, options);
	if (!updated) return apiResponse.failure('Trip not found');
	return apiResponse.success('Trip updated successfully', toTripDto(updated));
}

async function deleteTrip(tripId, options = {}) {
	const deleted = await TripRepository.deleteById(tripId, options);
	return apiResponse.success('Trip deleted successfully', { deleted });
}

// Pickup records
async function listPickupRecords({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await PickupRecordRepository.list({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toPickupRecordDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('Pickup records fetched successfully', data);
}

async function createPickupRecord(data, options = {}) {
	const created = await PickupRecordRepository.create({
		student_id: data.studentId,
		stop_id: data.stopId,
		trip_id: data.tripId,
		status: data.status,
		recorded_at: data.recordedAt,
	}, options);
	return apiResponse.success('Pickup record created successfully', toPickupRecordDto(created));
}

async function updatePickupRecord(recordId, changes, options = {}) {
	const updated = await PickupRecordRepository.updateById(recordId, {
		status: changes.status,
		recorded_at: changes.recordedAt,
	}, options);
	if (!updated) return apiResponse.failure('Pickup record not found');
	return apiResponse.success('Pickup record updated successfully', toPickupRecordDto(updated));
}

async function getPickupRecordById(recordId, options = {}) {
	const record = await PickupRecordRepository.findById(recordId, options);
	if (!record) return apiResponse.failure('Pickup record not found');
	return apiResponse.success('Pickup record fetched successfully', toPickupRecordDto(record));
}

async function deletePickupRecord(recordId, options = {}) {
	const deleted = await PickupRecordRepository.deleteById(recordId, options);
	return apiResponse.success('Pickup record deleted successfully', { deleted });
}

module.exports = {
	// Trips
	listTrips, getTripById, createTrip, updateTrip, deleteTrip,
	// Pickup records
	listPickupRecords, createPickupRecord, updatePickupRecord, getPickupRecordById, deletePickupRecord,
};
