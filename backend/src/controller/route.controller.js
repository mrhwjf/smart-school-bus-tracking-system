const routeService = require('../service/route.service');

exports.getAllRoutes = async (req, res) => {
  try {
    const includeStops = String(req.query.includeStops || '').toLowerCase() === 'true';
    const includeTrips = String(req.query.includeTrips || '').toLowerCase() === 'true';
    const routes = await routeService.getAllRoutes({ includeStops, includeTrips });
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRouteById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const includeStops = String(req.query.includeStops || 'true').toLowerCase() === 'true';
    const includeTrips = String(req.query.includeTrips || 'true').toLowerCase() === 'true';
    const route = await routeService.getRouteById(id, { includeStops, includeTrips });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const created = await routeService.createRoute(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [affected] = await routeService.updateRoute(id, req.body);
    if (!affected) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route updated', affected });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const affected = await routeService.deleteRoute(id);
    if (!affected) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
