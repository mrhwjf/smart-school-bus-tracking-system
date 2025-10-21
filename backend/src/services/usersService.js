const repo = require('../repositories/usersRepository');

function validate(payload) {
  const errors = [];
  if (!payload.name) errors.push('name is required');
  if (!payload.role_id) errors.push('role_id is required');
  return errors;
}

async function listUsers() { return repo.findAll(); }

async function getUser(id) { const u = await repo.findById(id); if (!u) { const err = new Error('User not found'); err.status = 404; throw err; } return u; }

async function createUser(payload) { const errors = validate(payload); if (errors.length) { const err = new Error(errors.join('; ')); err.status = 400; throw err; } return repo.create(payload); }

async function updateUser(id, payload) { const u = await repo.findById(id); if (!u) { const err = new Error('User not found'); err.status = 404; throw err; } return repo.update(id, payload); }

async function deleteUser(id) { const u = await repo.findById(id); if (!u) { const err = new Error('User not found'); err.status = 404; throw err; } await repo.remove(id); return true; }

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
