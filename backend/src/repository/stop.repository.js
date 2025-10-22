const db = require('../models');
const { Stop, Route } = db;

exports.findAllByRoute = (routeId) =>
  Stop.findAll({ where: { route_id: routeId }, order: [['seq_index', 'ASC']] });

exports.findById = (id) => Stop.findByPk(id, { include: [{ model: Route }] });

exports.createForRoute = (routeId, data) => Stop.create({ ...data, route_id: routeId });

exports.update = (id, data) => Stop.update(data, { where: { stop_id: id } });

exports.remove = (id) => Stop.destroy({ where: { stop_id: id } });
