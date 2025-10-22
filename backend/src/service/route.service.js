const routeRepo = require('../repository/route.repository');

exports.getAllRoutes = async (options = {}) => routeRepo.findAll(options);
exports.getRouteById = async (id, options = {}) => routeRepo.findById(id, options);
exports.createRoute = async (data) => routeRepo.create(data);
exports.updateRoute = async (id, data) => routeRepo.update(id, data);
exports.deleteRoute = async (id) => routeRepo.remove(id);
