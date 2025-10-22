const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

async function findAll() { return await sequelize.query('SELECT * FROM users', { type: QueryTypes.SELECT }); }

async function findById(id) {
  const rows = await sequelize.query('SELECT * FROM users WHERE user_id = :id', { replacements: { id }, type: QueryTypes.SELECT });
  return rows[0] || null;
}

async function create(user) {
  const { role_id, name, phone_number, email, password_hash, is_active } = user;
  await sequelize.query('INSERT INTO users (role_id, name, phone_number, email, password_hash, is_active) VALUES (:role_id,:name,:phone_number,:email,:password_hash,:is_active)', {
    replacements: { role_id, name, phone_number, email, password_hash, is_active }
  });
  const rows = await sequelize.query('SELECT * FROM users ORDER BY user_id DESC LIMIT 1', { type: QueryTypes.SELECT });
  return rows[0] || null;
}

async function update(id, user) {
  const fields = [];
  const replacements = { id };
  if (user.role_id !== undefined) { fields.push('role_id = :role_id'); replacements.role_id = user.role_id; }
  if (user.name !== undefined) { fields.push('name = :name'); replacements.name = user.name; }
  if (user.phone_number !== undefined) { fields.push('phone_number = :phone_number'); replacements.phone_number = user.phone_number; }
  if (user.email !== undefined) { fields.push('email = :email'); replacements.email = user.email; }
  if (user.password_hash !== undefined) { fields.push('password_hash = :password_hash'); replacements.password_hash = user.password_hash; }
  if (user.is_active !== undefined) { fields.push('is_active = :is_active'); replacements.is_active = user.is_active; }
  if (fields.length === 0) return findById(id);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE user_id = :id`;
  await sequelize.query(sql, { replacements });
  return findById(id);
}

async function remove(id) { await sequelize.query('DELETE FROM users WHERE user_id = :id', { replacements: { id } }); const row = await findById(id); return row === null; }

module.exports = { findAll, findById, create, update, remove };
