const tripPassengerRepo = require('../repository/tripPassenger.repository');

exports.listByTrip = async (tripId) => tripPassengerRepo.listByTrip(tripId);
exports.addPassenger = async (tripId, studentId) => tripPassengerRepo.add(tripId, studentId);
exports.bulkAddPassengers = async (tripId, studentIds = []) => tripPassengerRepo.bulkAdd(tripId, studentIds);
exports.removePassenger = async (tripId, studentId) => tripPassengerRepo.remove(tripId, studentId);
exports.clearPassengers = async (tripId) => tripPassengerRepo.clear(tripId);
