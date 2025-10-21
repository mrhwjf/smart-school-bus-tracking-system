const service = require('../services/parentsService');

async function list(req, res, next) {
  try {
    const items = await service.listParents();
    res.json(items);
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const item = await service.getParent(parseInt(req.params.id, 10));
    res.json(item);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const created = await service.createParent(req.body);
    res.status(201).json(created);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const updated = await service.updateParent(parseInt(req.params.id, 10), req.body);
    res.json(updated);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await service.deleteParent(parseInt(req.params.id, 10));
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, update, remove };
