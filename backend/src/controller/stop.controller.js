const stopService = require('../service/stop.service');

exports.getStopsByRoute = async (req, res) => {
  try {
    const routeId = parseInt(req.params.routeId ?? req.query.route_id, 10);
    if (!routeId) return res.status(400).json({ message: 'routeId is required' });
    const stops = await stopService.getStopsByRoute(routeId);
    res.json(stops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStopById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const stop = await stopService.getStopById(id);
    if (!stop) return res.status(404).json({ message: 'Stop not found' });
    res.json(stop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStopForRoute = async (req, res) => {
  try {
    const routeId = parseInt(req.params.routeId ?? req.body.route_id, 10);
    if (!routeId) return res.status(400).json({ message: 'routeId is required' });
    const created = await stopService.createStopForRoute(routeId, req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStop = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [affected] = await stopService.updateStop(id, req.body);
    if (!affected) return res.status(404).json({ message: 'Stop not found' });
    res.json({ message: 'Stop updated', affected });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteStop = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const affected = await stopService.deleteStop(id);
    if (!affected) return res.status(404).json({ message: 'Stop not found' });
    res.json({ message: 'Stop deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
