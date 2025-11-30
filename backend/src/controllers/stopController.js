const { stopService } = require('../services');
const { validationResult } = require('express-validator');

async function listStops(req, res, next) {
	try {
		const { page = 0, size = 10, name, address, active, sortField, sortDirection } = req.query;
		const filter = {};
		if (name) filter.name = String(name);
		if (address) filter.address = String(address);
		if (typeof active === 'boolean') filter.active = active;
		const allowedSortFields = ['stop_id', 'name', 'created_at'];
		const sort = sortField && allowedSortFields.includes(sortField)
			? { field: sortField, direction: sortDirection === 'DESC' ? 'DESC' : 'ASC' }
			: undefined;
		const result = await stopService.listStops({ filter, sort, page: Number(page), pageSize: Number(size) });
		res.json(result);
	} catch (err) { next(err); }
}

async function getStop(req, res, next) {
	try {
		const { stopId } = req.params;
		const result = await stopService.getStopById(Number(stopId));
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function createStop(req, res, next) {
	try {
		const result = await stopService.createStop(req.body);
		res.status(201).json(result);
	} catch (err) { next(err); }
}

async function updateStop(req, res, next) {
	try {
		const { stopId } = req.params;
		const result = await stopService.updateStop(Number(stopId), req.body);
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function deleteStop(req, res, next) {
	try {
		const { stopId } = req.params;
		const result = await stopService.deleteStop(Number(stopId));
		res.json(result);
	} catch (err) { next(err); }
}

module.exports = { listStops, getStop, createStop, updateStop, deleteStop };
