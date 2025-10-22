const tripStopService = require('../service/tripStop.service');

exports.listByTrip = async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const rows = await tripStopService.listByTrip(tripId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addStop = async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const { stop_id, stop_order = 0 } = req.body || {};
    if (!stop_id) return res.status(400).json({ message: 'stop_id is required' });
    const created = await tripStopService.addStop(tripId, parseInt(stop_id, 10), parseInt(stop_order, 10) || 0);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const stopId = parseInt(req.params.stopId ?? req.body.stop_id, 10);
    const stopOrder = parseInt(req.body.stop_order, 10);
    if (!stopId && stopId !== 0) return res.status(400).json({ message: 'stop_id is required' });
    if (Number.isNaN(stopOrder)) return res.status(400).json({ message: 'stop_order is required' });
    const [affected] = await tripStopService.updateOrder(tripId, stopId, stopOrder);
    if (!affected) return res.status(404).json({ message: 'TripStop not found' });
    res.json({ message: 'Stop order updated', affected });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeStop = async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const stopId = parseInt(req.params.stopId, 10);
    const affected = await tripStopService.removeStop(tripId, stopId);
    if (!affected) return res.status(404).json({ message: 'TripStop not found' });
    res.json({ message: 'TripStop removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.replaceAll = async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const { stopIdsOrdered = [] } = req.body || {};
    const count = await tripStopService.replaceAll(tripId, stopIdsOrdered);
    res.json({ message: 'Trip stops replaced', count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
