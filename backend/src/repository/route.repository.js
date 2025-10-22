const db = require('../models');
const { Route, Stop, Trip } = db;

exports.findAll = async (options = {}) => {
  const { includeStops = false, includeTrips = false } = options;
  const include = [];
  if (includeStops) include.push({ model: Stop });
  if (includeTrips) include.push({ model: Trip });
  const query = include.length ? { include } : {};
  if (includeStops) query.order = [[Stop, 'seq_index', 'ASC']];
  return Route.findAll(query);
};

exports.findById = async (id, options = {}) => {
  const { includeStops = true, includeTrips = true } = options;
  const include = [];
  if (includeStops) include.push({ model: Stop });
  if (includeTrips) include.push({ model: Trip });
  return Route.findByPk(id, { include, order: includeStops ? [[Stop, 'seq_index', 'ASC']] : undefined });
};

exports.create = (data) => Route.create(data);
exports.update = (id, data) => Route.update(data, { where: { route_id: id } });
exports.remove = (id) => Route.destroy({ where: { route_id: id } });
