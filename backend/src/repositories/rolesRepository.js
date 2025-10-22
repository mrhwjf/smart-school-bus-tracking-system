const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

async function findAll() { return await sequelize.query('SELECT * FROM roles', { type: QueryTypes.SELECT }); }
async function findById(id) { const rows = await sequelize.query('SELECT * FROM roles WHERE role_id = :id', { replacements: { id }, type: QueryTypes.SELECT }); return rows[0] || null; }
async function create(payload) { await sequelize.query('INSERT INTO roles (name, description) VALUES (:name, :description)', { replacements: { name: payload.name, description: payload.description } }); const rows = await sequelize.query('SELECT * FROM roles ORDER BY role_id DESC LIMIT 1', { type: QueryTypes.SELECT }); return rows[0] || null; }
async function update(id, payload) { const fields = []; const replacements = { id }; if (payload.name !== undefined) { fields.push('name = :name'); replacements.name = payload.name; } if (payload.description !== undefined) { fields.push('description = :description'); replacements.description = payload.description; } if (fields.length === 0) return findById(id); const sql = `UPDATE roles SET ${fields.join(', ')} WHERE role_id = :id`; await sequelize.query(sql, { replacements }); return findById(id); }
async function remove(id) { await sequelize.query('DELETE FROM roles WHERE role_id = :id', { replacements: { id } }); const row = await findById(id); return row === null; }

module.exports = { findAll, findById, create, update, remove };
