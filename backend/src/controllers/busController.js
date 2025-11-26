const { busService } = require('../services');

async function listBuses(req, res, next) {
	try {
		const { page = 0, size = 10, status, plateNumber, model, sortField, sortDirection } = req.query;
		const filter = {};
		if (status) filter.status = String(status);
		if (plateNumber) filter.plate_number = String(plateNumber);
		if (model) filter.model = String(model);
		const allowedSortFields = ['bus_id', 'plate_number', 'created_at'];
		const sort = sortField && allowedSortFields.includes(sortField)
			? { field: sortField, direction: sortDirection === 'DESC' ? 'DESC' : 'ASC' }
			: undefined;
		const result = await busService.listBuses({ filter, sort, page: Number(page), pageSize: Number(size) });
		res.json(result);
	} catch (err) { next(err); }
}

async function getBus(req, res, next) {
	try {
		const { busId } = req.params;
		const result = await busService.getBusById(Number(busId));
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function createBus(req, res, next) {
	try {
		const result = await busService.createBus(req.body);
		res.status(201).json(result);
	} catch (err) { next(err); }
}

async function updateBus(req, res, next) {
	try {
		const { busId } = req.params;
		const result = await busService.updateBus(Number(busId), req.body);
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function deleteBus(req, res, next) {
	try {
		const { busId } = req.params;
		const result = await busService.deleteBus(Number(busId));
		res.json(result);
	} catch (err) { next(err); }
}

module.exports = { listBuses, getBus, createBus, updateBus, deleteBus };
