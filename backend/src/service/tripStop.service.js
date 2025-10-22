const tripStopRepo = require('../repository/tripStop.repository');

exports.listByTrip = async (tripId) => tripStopRepo.listByTrip(tripId);
exports.addStop = async (tripId, stopId, stopOrder = 0) => tripStopRepo.add(tripId, stopId, stopOrder);
exports.updateOrder = async (tripId, stopId, stopOrder) => tripStopRepo.updateOrder(tripId, stopId, stopOrder);
exports.removeStop = async (tripId, stopId) => tripStopRepo.remove(tripId, stopId);
exports.replaceAll = async (tripId, stopIdsOrdered = []) => tripStopRepo.replaceAll(tripId, stopIdsOrdered);
