const service = require('../services/pickupRecordsService');

async function list(req, res, next) {
  try { res.json(await service.listPickupRecords()); } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try { res.json(await service.getPickupRecord(parseInt(req.params.id, 10))); } catch (err) { next(err); }
}

async function create(req, res, next) {
  try { const created = await service.createPickupRecord(req.body); res.status(201).json(created); } catch (err) { next(err); }
}

async function update(req, res, next) {
  try { const updated = await service.updatePickupRecord(parseInt(req.params.id, 10), req.body); res.json(updated); } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try { await service.deletePickupRecord(parseInt(req.params.id, 10)); res.status(204).end(); } catch (err) { next(err); }
}

module.exports = { list, getById, create, update, remove };
