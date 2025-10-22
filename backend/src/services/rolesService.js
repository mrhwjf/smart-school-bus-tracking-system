const repo = require('../repositories/rolesRepository');

async function listRoles() { return repo.findAll(); }
async function getRole(id) { const r = await repo.findById(id); if (!r) { const err = new Error('Role not found'); err.status = 404; throw err; } return r; }
async function createRole(payload) { return repo.create(payload); }
async function updateRole(id, payload) { const r = await repo.findById(id); if (!r) { const err = new Error('Role not found'); err.status = 404; throw err; } return repo.update(id, payload); }
async function deleteRole(id) { const r = await repo.findById(id); if (!r) { const err = new Error('Role not found'); err.status = 404; throw err; } await repo.remove(id); return true; }

module.exports = { listRoles, getRole, createRole, updateRole, deleteRole };
