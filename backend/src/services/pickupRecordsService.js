const repo = require('../repositories/pickupRecordsRepository');

function validatePayload(payload) {
  const errors = [];
  if (!payload.student_id) errors.push('student_id is required');
  if (!payload.stop_id) errors.push('stop_id is required');
  // status optional but should be one of allowed values if present
  return errors;
}

async function listPickupRecords() { return repo.findAll(); }

async function getPickupRecord(id) {
  const r = await repo.findById(id);
  if (!r) { const err = new Error('PickupRecord not found'); err.status = 404; throw err; }
  return r;
}

async function createPickupRecord(payload) {
  const errors = validatePayload(payload);
  if (errors.length) { const err = new Error(errors.join('; ')); err.status = 400; throw err; }
  return repo.create(payload);
}

async function updatePickupRecord(id, payload) {
  const r = await repo.findById(id);
  if (!r) { const err = new Error('PickupRecord not found'); err.status = 404; throw err; }
  return repo.update(id, payload);
}

async function deletePickupRecord(id) {
  const r = await repo.findById(id);
  if (!r) { const err = new Error('PickupRecord not found'); err.status = 404; throw err; }
  await repo.remove(id);
  return true;
}

module.exports = { listPickupRecords, getPickupRecord, createPickupRecord, updatePickupRecord, deletePickupRecord };
