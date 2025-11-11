const { tripService } = require('../services');
const { validationResult } = require('express-validator');

function handleValidation(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', success: false, data: errors.array(), timestamp: new Date().toISOString() });
	return next();
}

// Trips
async function listTrips(req, res, next) {
	try {
		const { page = 0, size = 10, scheduleId, tripDate, status } = req.query;
		const filter = {};
		if (scheduleId) filter.schedule_id = Number(scheduleId);
		if (tripDate) filter.trip_date = tripDate;
		if (status) filter.status = status;
		const result = await tripService.listTrips({ filter, page: Number(page), pageSize: Number(size) });
		res.json(result);
	} catch (err) { next(err); }
}

async function getTrip(req, res, next) {
	try {
		const { tripId } = req.params;
		const result = await tripService.getTripById(Number(tripId));
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function createTrip(req, res, next) {
	try {
		const result = await tripService.createTrip(req.body);
		res.status(201).json(result);
	} catch (err) { next(err); }
}

async function updateTrip(req, res, next) {
	try {
		const { tripId } = req.params;
		const result = await tripService.updateTrip(Number(tripId), req.body);
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function deleteTrip(req, res, next) {
	try {
		const { tripId } = req.params;
		const result = await tripService.deleteTrip(Number(tripId));
		res.json(result);
	} catch (err) { next(err); }
}

// Trip stops
async function addTripStop(req, res, next) {
	try {
		const result = await tripService.addTripStop(req.body);
		res.status(201).json(result);
	} catch (err) { next(err); }
}

async function updateTripStop(req, res, next) {
	try {
		const { tripId, stopId } = req.params;
		const result = await tripService.updateTripStop(Number(tripId), Number(stopId), req.body);
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function removeTripStop(req, res, next) {
	try {
		const { tripId, stopId } = req.params;
		const result = await tripService.removeTripStop(Number(tripId), Number(stopId));
		res.json(result);
	} catch (err) { next(err); }
}

// Pickup records
async function listPickupRecords(req, res, next) {
	try {
		const { page = 0, size = 10, tripId, studentId } = req.query;
		const filter = {};
		if (tripId) filter.trip_id = Number(tripId);
		if (studentId) filter.student_id = Number(studentId);
		const result = await tripService.listPickupRecords({ filter, page: Number(page), pageSize: Number(size) });
		res.json(result);
	} catch (err) { next(err); }
}

async function createPickupRecord(req, res, next) {
	try {
		const result = await tripService.createPickupRecord(req.body);
		res.status(201).json(result);
	} catch (err) { next(err); }
}

async function updatePickupRecord(req, res, next) {
	try {
		const { recordId } = req.params;
		const result = await tripService.updatePickupRecord(Number(recordId), req.body);
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

module.exports = {
	handleValidation,
	// Trips
	listTrips, getTrip, createTrip, updateTrip, deleteTrip,
	// Pickup records
	listPickupRecords, createPickupRecord, updatePickupRecord,
};
