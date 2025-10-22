const db = require('../models');
const tripRepo = require('../repository/trip.repository');

const sequelize = db.sequelize;

exports.getTrips = async (filter = {}) => tripRepo.findAll(filter);
exports.getTripById = async (id) => tripRepo.findById(id);
exports.createTrip = async (data) => tripRepo.create(data);
exports.updateTrip = async (id, data) => tripRepo.update(id, data);
exports.deleteTrip = async (id) => tripRepo.remove(id);

exports.setStopsAndPassengers = async (tripId, stopIdsOrdered = [], studentIds = []) => {
  return sequelize.transaction(async (t) => {
    await tripRepo.setStops(tripId, stopIdsOrdered, t);
    await tripRepo.setPassengers(tripId, studentIds, t);
    return { stops: stopIdsOrdered.length, passengers: studentIds.length };
  });
};

exports.setStops = async (tripId, stopIdsOrdered = []) => tripRepo.setStops(tripId, stopIdsOrdered);
exports.setPassengers = async (tripId, studentIds = []) => tripRepo.setPassengers(tripId, studentIds);
