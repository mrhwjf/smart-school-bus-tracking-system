const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

async function findAll() {
  return await sequelize.query('SELECT * FROM pickup_records', { type: QueryTypes.SELECT });
}

async function findById(id) {
  const rows = await sequelize.query('SELECT * FROM pickup_records WHERE record_id = :id', {
    replacements: { id }, type: QueryTypes.SELECT
  });
  return rows[0] || null;
}

async function create(record) {
  const { student_id, stop_id, status, recorded_at } = record;
  await sequelize.query('INSERT INTO pickup_records (student_id, stop_id, status, recorded_at) VALUES (:student_id, :stop_id, :status, :recorded_at)', {
    replacements: { student_id, stop_id, status, recorded_at }
  });
  const rows = await sequelize.query('SELECT * FROM pickup_records ORDER BY record_id DESC LIMIT 1', { type: QueryTypes.SELECT });
  return rows[0] || null;
}

async function update(id, record) {
  const fields = [];
  const replacements = { id };
  if (record.student_id !== undefined) { fields.push('student_id = :student_id'); replacements.student_id = record.student_id; }
  if (record.stop_id !== undefined) { fields.push('stop_id = :stop_id'); replacements.stop_id = record.stop_id; }
  if (record.status !== undefined) { fields.push('status = :status'); replacements.status = record.status; }
  if (record.recorded_at !== undefined) { fields.push('recorded_at = :recorded_at'); replacements.recorded_at = record.recorded_at; }
  if (fields.length === 0) return findById(id);
  const sql = `UPDATE pickup_records SET ${fields.join(', ')} WHERE record_id = :id`;
  await sequelize.query(sql, { replacements });
  return findById(id);
}

async function remove(id) {
  await sequelize.query('DELETE FROM pickup_records WHERE record_id = :id', { replacements: { id } });
  const row = await findById(id);
  return row === null;
}

module.exports = { findAll, findById, create, update, remove };
