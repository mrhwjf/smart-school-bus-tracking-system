const db = require('../models');
const { sequelize, TripStop, Stop } = { sequelize: db.sequelize, TripStop: db.TripStop, Stop: db.Stop };

exports.listByTrip = (tripId) =>
  TripStop.findAll({ where: { trip_id: tripId }, include: [{ model: Stop }], order: [['stop_order', 'ASC']] });

exports.add = (tripId, stopId, stopOrder = 0) =>
  TripStop.create({ trip_id: tripId, stop_id: stopId, stop_order: stopOrder });

exports.updateOrder = (tripId, stopId, stopOrder) =>
  TripStop.update({ stop_order: stopOrder }, { where: { trip_id: tripId, stop_id: stopId } });

exports.remove = (tripId, stopId) =>
  TripStop.destroy({ where: { trip_id: tripId, stop_id: stopId } });

exports.replaceAll = async (tripId, stopIdsOrdered = [], t) => {
  const run = async (transaction) => {
    await TripStop.destroy({ where: { trip_id: tripId }, transaction });
    if (!stopIdsOrdered.length) return 0;
    const rows = stopIdsOrdered.map((stop_id, idx) => ({ trip_id: tripId, stop_id, stop_order: idx + 1 }));
    await TripStop.bulkCreate(rows, { transaction });
    return rows.length;
  };
  if (t) return run(t);
  return sequelize.transaction(run);
};
