const apiResponse = require('../utils/apiResponse');
const createPagination = require('../utils/pagination');
const { toRouteDto, toRouteStopsDtoList, toRoutePassengerDto } = require('../dtos');
const { RouteRepository } = require('../repositories');
const { sequelize } = require('../models');


// Routes
async function listRoutes({ filter = {}, sort, page = 0, pageSize = 10 } = {}, options = {}) {
	const { rows, count, page: p, pageSize: s, totalPages } = await RouteRepository.list({ filter, sort, page, pageSize }, options);
	const items = (rows || []).map(toRouteDto);
	const data = createPagination({ items, page: p, size: s, totalElements: count, totalPages });
	return apiResponse.success('Routes fetched successfully', data);
}
async function getRouteById(routeId, options = {}) {
	const route = await RouteRepository.findById(routeId, options);
	if (!route) return apiResponse.failure('Route not found');
	return apiResponse.success('Route fetched successfully', toRouteDto(route));
}
async function createRoute(data, options = {}) {
	const created = await RouteRepository.create({
		name: data.name,
		description: data.description,
	}, options);
	return apiResponse.success('Route created successfully', toRouteDto(created));
}
async function updateRoute(routeId, changes, options = {}) {
	const updated = await RouteRepository.updateById(routeId, {
		name: changes.name,
		description: changes.description
	}, options);
	if (!updated) return apiResponse.failure('Route not found');
	return apiResponse.success('Route updated successfully', toRouteDto(updated));
}
async function deleteRoute(routeId, options = {}) {
	const deleted = await RouteRepository.deleteById(routeId, options);
	return apiResponse.success('Route deleted successfully', { deleted });
}

// Stops management
async function getRouteStops(routeId, options = {}) {
	const rows = await RouteRepository.getRouteStops(routeId, options);
	return apiResponse.success('Route stops fetched successfully', toRouteStopsDtoList(rows));
}

async function replaceRouteStops(routeId, stops = []) {
	return sequelize.transaction(async (t) => {
		const replaced = await RouteRepository.replaceRouteStops(routeId, stops, { transaction: t });
		return apiResponse.success('Route stops replaced successfully', toRouteStopsDtoList(replaced));
	});
}

// Passengers management
async function getRoutePassengers(routeId, options = {}) {
	const rows = await RouteRepository.getRoutePassengers(routeId, options);
	const items = rows.map(toRoutePassengerDto);
	return apiResponse.success('Route passengers fetched successfully', items);
}

async function replaceRoutePassengers(routeId, studentIds = []) {
	return sequelize.transaction(async (t) => {
		const replaced = await RouteRepository.replaceRoutePassengers(routeId, studentIds, { transaction: t });
		const items = replaced.map(toRoutePassengerDto);
		return apiResponse.success('Route passengers replaced successfully', items);
	});
}

module.exports = {
	listRoutes,
	getRouteById,
	createRoute,
	updateRoute,
	deleteRoute,
	getRouteStops,
	replaceRouteStops,
	getRoutePassengers,
	replaceRoutePassengers,
};