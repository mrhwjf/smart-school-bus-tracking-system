const db = require('../models');
const { sequelize, TripPassenger, Student } = {
  sequelize: db.sequelize,
  TripPassenger: db.TripPassenger,
  Student: db.Student,
};

exports.listByTrip = (tripId) =>
  TripPassenger.findAll({ where: { trip_id: tripId }, include: [{ model: Student }] });

exports.add = (tripId, studentId) => TripPassenger.create({ trip_id: tripId, student_id: studentId });

exports.bulkAdd = (tripId, studentIds = [], t) => {
  const run = async (transaction) => {
    if (!studentIds.length) return 0;
    const rows = studentIds.map((student_id) => ({ trip_id: tripId, student_id }));
    await TripPassenger.bulkCreate(rows, { transaction, ignoreDuplicates: true });
    return rows.length;
  };
  if (t) return run(t);
  return sequelize.transaction(run);
};

exports.remove = (tripId, studentId) =>
  TripPassenger.destroy({ where: { trip_id: tripId, student_id: studentId } });

exports.clear = (tripId) => TripPassenger.destroy({ where: { trip_id: tripId } });
