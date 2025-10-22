const { Op } = require('sequelize');
const db = require('../models');
const { sequelize, Trip, Route, Bus, Stop, Student, TripStop, TripPassenger } = {
  sequelize: db.sequelize,
  Trip: db.Trip,
  Route: db.Route,
  Bus: db.Bus,
  Stop: db.Stop,
  Student: db.Student,
  TripStop: db.TripStop,
  TripPassenger: db.TripPassenger,
};

exports.findAll = (filter = {}) => {
  const where = {};
  if (filter.route_id) where.route_id = filter.route_id;
  if (filter.bus_id) where.bus_id = filter.bus_id;
  if (filter.status) where.status = filter.status;
  if (filter.startFrom || filter.startTo) {
    where.start_time = {};
    if (filter.startFrom) where.start_time[Op.gte] = filter.startFrom;
    if (filter.startTo) where.start_time[Op.lte] = filter.startTo;
  }
  return Trip.findAll({
    where,
    include: [{ model: Route }, { model: Bus }],
    order: [['start_time', 'DESC']],
  });
};

exports.findById = async (id) => {
  const trip = await Trip.findByPk(id, {
    include: [
      { model: Route },
      { model: Bus },
      { model: Stop, through: { attributes: ['stop_order'] } },
      { model: Student, through: { attributes: [] } },
    ],
  });
  if (trip?.Stops?.length) {
    trip.Stops = [...trip.Stops].sort(
      (a, b) => (a.TripStop?.stop_order ?? 0) - (b.TripStop?.stop_order ?? 0)
    );
  }
  return trip;
};

exports.create = (data) => Trip.create(data);
exports.update = (id, data) => Trip.update(data, { where: { trip_id: id } });
exports.remove = (id) => Trip.destroy({ where: { trip_id: id } });

exports.setStops = async (tripId, stopIdsOrdered = [], t) => {
  const run = async (transaction) => {
    await TripStop.destroy({ where: { trip_id: tripId }, transaction });
    if (!stopIdsOrdered.length) return 0;
    const rows = stopIdsOrdered.map((stop_id, idx) => ({
      trip_id: tripId,
      stop_id,
      stop_order: idx + 1,
    }));
    await TripStop.bulkCreate(rows, { transaction });
    return rows.length;
  };
  if (t) return run(t);
  return sequelize.transaction(run);
};

exports.setPassengers = async (tripId, studentIds = [], t) => {
  const run = async (transaction) => {
    await TripPassenger.destroy({ where: { trip_id: tripId }, transaction });
    if (!studentIds.length) return 0;
    const rows = studentIds.map((student_id) => ({ trip_id: tripId, student_id }));
    await TripPassenger.bulkCreate(rows, { transaction });
    return rows.length;
  };
  if (t) return run(t);
  return sequelize.transaction(run);
};
