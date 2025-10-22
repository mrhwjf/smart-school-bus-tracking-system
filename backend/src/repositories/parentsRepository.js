const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

async function findAll() {
  return await sequelize.query('SELECT * FROM parents', { type: QueryTypes.SELECT });
}

async function findById(id) {
  const rows = await sequelize.query('SELECT * FROM parents WHERE parent_id = :id', {
    replacements: { id }, type: QueryTypes.SELECT
  });
  return rows[0] || null;
}

async function create(parent) {
  // parent may include parent_id (linked to users) or not; assume user creation handled elsewhere
  const { parent_id, relationship } = parent;
  if (parent_id) {
    await sequelize.query('INSERT INTO parents (parent_id, relationship) VALUES (:parent_id, :relationship)', {
      replacements: { parent_id, relationship }
    });
  } else {
    const res = await sequelize.query('INSERT INTO parents (relationship) VALUES (:relationship)', { replacements: { relationship } });
  }
  const rows = await sequelize.query('SELECT * FROM parents ORDER BY parent_id DESC LIMIT 1', { type: QueryTypes.SELECT });
  return rows[0] || null;
}

async function update(id, parent) {
  const fields = [];
  const replacements = { id };
  if (parent.relationship !== undefined) { fields.push('relationship = :relationship'); replacements.relationship = parent.relationship; }
  if (fields.length === 0) return findById(id);
  const sql = `UPDATE parents SET ${fields.join(', ')} WHERE parent_id = :id`;
  await sequelize.query(sql, { replacements });
  return findById(id);
}

async function remove(id) {
  await sequelize.query('DELETE FROM parents WHERE parent_id = :id', { replacements: { id } });
  const row = await findById(id);
  return row === null;
}

module.exports = { findAll, findById, create, update, remove };
