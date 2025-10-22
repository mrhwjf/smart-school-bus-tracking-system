const tripService = require('../service/trip.service');

exports.getTrips = async (req, res) => {
  try {
    const filter = {
      route_id: req.query.route_id ? parseInt(req.query.route_id, 10) : undefined,
      bus_id: req.query.bus_id ? parseInt(req.query.bus_id, 10) : undefined,
      status: req.query.status,
      startFrom: req.query.startFrom,
      startTo: req.query.startTo,
    };
    const trips = await tripService.getTrips(filter);
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const trip = await tripService.getTripById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTrip = async (req, res) => {
  try {
    const created = await tripService.createTrip(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [affected] = await tripService.updateTrip(id, req.body);
    if (!affected) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip updated', affected });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const affected = await tripService.deleteTrip(id);
    if (!affected) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setStopsAndPassengers = async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const { stopIdsOrdered = [], studentIds = [] } = req.body || {};
    const result = await tripService.setStopsAndPassengers(tripId, stopIdsOrdered, studentIds);
    res.json({ message: 'Trip stops and passengers updated', ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setStops = async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const { stopIdsOrdered = [] } = req.body || {};
    const count = await tripService.setStops(tripId, stopIdsOrdered);
    res.json({ message: 'Trip stops updated', count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setPassengers = async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    const { studentIds = [] } = req.body || {};
    const count = await tripService.setPassengers(tripId, studentIds);
    res.json({ message: 'Trip passengers updated', count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
