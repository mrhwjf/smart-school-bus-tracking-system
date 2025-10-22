const stopRepo = require('../repository/stop.repository');

exports.getStopsByRoute = async (routeId) => stopRepo.findAllByRoute(routeId);
exports.getStopById = async (id) => stopRepo.findById(id);
exports.createStopForRoute = async (routeId, data) => stopRepo.createForRoute(routeId, data);
exports.updateStop = async (id, data) => stopRepo.update(id, data);
exports.deleteStop = async (id) => stopRepo.remove(id);
