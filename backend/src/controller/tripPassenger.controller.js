const tripPassengerService = require('../service/tripPassenger.service');

exports.listByTrip = async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const rows = await tripPassengerService.listByTrip(tripId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addPassenger = async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const { student_id } = req.body || {};
    if (!student_id) return res.status(400).json({ message: 'student_id is required' });
    const created = await tripPassengerService.addPassenger(tripId, parseInt(student_id, 10));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bulkAddPassengers = async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const { studentIds = [] } = req.body || {};
    const count = await tripPassengerService.bulkAddPassengers(tripId, studentIds);
    res.json({ message: 'Passengers added', count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removePassenger = async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const studentId = parseInt(req.params.studentId ?? req.body.student_id, 10);
    if (!studentId) return res.status(400).json({ message: 'studentId is required' });
    const affected = await tripPassengerService.removePassenger(tripId, studentId);
    if (!affected) return res.status(404).json({ message: 'Passenger not found on this trip' });
    res.json({ message: 'Passenger removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearPassengers = async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const affected = await tripPassengerService.clearPassengers(tripId);
    res.json({ message: 'Passengers cleared', affected });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
