const repo = require('../repositories/parentsRepository');

function validateParentPayload(payload) {
  const errors = [];
  // parent is a subtype of user; minimal validation here
  return errors;
}

async function listParents() {
  return repo.findAll();
}

async function getParent(id) {
  const p = await repo.findById(id);
  if (!p) { const err = new Error('Parent not found'); err.status = 404; throw err; }
  return p;
}

async function createParent(payload) {
  const errors = validateParentPayload(payload);
  if (errors.length) { const err = new Error(errors.join('; ')); err.status = 400; throw err; }
  return repo.create(payload);
}

async function updateParent(id, payload) {
  const p = await repo.findById(id);
  if (!p) { const err = new Error('Parent not found'); err.status = 404; throw err; }
  return repo.update(id, payload);
}

async function deleteParent(id) {
  const p = await repo.findById(id);
  if (!p) { const err = new Error('Parent not found'); err.status = 404; throw err; }
  await repo.remove(id);
  return true;
}

module.exports = { listParents, getParent, createParent, updateParent, deleteParent };
