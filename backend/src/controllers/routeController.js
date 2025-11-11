const { routeService } = require('../services');

// Routes CRUD
async function listRoutes(req, res, next) {
	try {
		const { page = 0, size = 10, name, sortField, sortDirection } = req.query;
		const filter = {};
		if (name) filter.name = String(name);
		const allowedSortFields = ['route_id', 'name', 'created_at'];
		const sort = sortField && allowedSortFields.includes(sortField)
			? { field: sortField, direction: sortDirection === 'DESC' ? 'DESC' : 'ASC' }
			: undefined;
		const result = await routeService.listRoutes({ filter, sort, page: Number(page), pageSize: Number(size) });
		res.json(result);
	} catch (err) { next(err); }
}

async function getRoute(req, res, next) {
	try {
		const { routeId } = req.params;
		const result = await routeService.getRouteById(Number(routeId));
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function createRoute(req, res, next) {
	try {
		const result = await routeService.createRoute(req.body);
		res.status(201).json(result);
	} catch (err) { next(err); }
}

async function updateRoute(req, res, next) {
	try {
		const { routeId } = req.params;
		const result = await routeService.updateRoute(Number(routeId), req.body);
		const status = result.success ? 200 : 404;
		res.status(status).json(result);
	} catch (err) { next(err); }
}

async function deleteRoute(req, res, next) {
	try {
		const { routeId } = req.params;
		const result = await routeService.deleteRoute(Number(routeId));
		res.json(result);
	} catch (err) { next(err); }
}

// Route stops
async function getRouteStops(req, res, next) {
	try {
		const { routeId } = req.params;
		const result = await routeService.getRouteStops(Number(routeId));
		res.json(result);
	} catch (err) { next(err); }
}

async function replaceRouteStops(req, res, next) {
	try {
		const { routeId } = req.params;
		const { stops = [] } = req.body || {};
		const result = await routeService.replaceRouteStops(Number(routeId), stops);
		res.json(result);
	} catch (err) { next(err); }
}

// Route passengers
async function getRoutePassengers(req, res, next) {
	try {
		const { routeId } = req.params;
		const result = await routeService.getRoutePassengers(Number(routeId));
		res.json(result);
	} catch (err) { next(err); }
}

async function replaceRoutePassengers(req, res, next) {
	try {
		const { routeId } = req.params;
		const { studentIds = [] } = req.body || {};
		const result = await routeService.replaceRoutePassengers(Number(routeId), studentIds);
		res.json(result);
	} catch (err) { next(err); }
}

module.exports = {
	listRoutes,
	getRoute,
	createRoute,
	updateRoute,
	deleteRoute,
	getRouteStops,
	replaceRouteStops,
	getRoutePassengers,
	replaceRoutePassengers,
};
