const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

async function findAll() {
  const rows = await sequelize.query('SELECT * FROM students', { type: QueryTypes.SELECT });
  return rows;
}

async function findById(id) {
  const rows = await sequelize.query('SELECT * FROM students WHERE student_id = :id', {
    replacements: { id },
    type: QueryTypes.SELECT
  });
  return rows[0] || null;
}

async function create(student) {
  const { parent_id, name, class: className, gender, date_of_birth } = student;
  const result = await sequelize.query(
    'INSERT INTO students (parent_id, name, class, gender, date_of_birth) VALUES (:parent_id, :name, :className, :gender, :dob)',
    {
      replacements: { parent_id, name, className, gender, dob: date_of_birth }
    }
  );
  // result doesn't contain insertId in a consistent way across dialects; fetch last inserted row by max id
  const rows = await sequelize.query('SELECT * FROM students ORDER BY student_id DESC LIMIT 1', { type: QueryTypes.SELECT });
  return rows[0] || null;
}

async function update(id, student) {
  const fields = [];
  const replacements = { id };
  if (student.parent_id !== undefined) { fields.push('parent_id = :parent_id'); replacements.parent_id = student.parent_id; }
  if (student.name !== undefined) { fields.push('name = :name'); replacements.name = student.name; }
  if (student.class !== undefined) { fields.push('class = :class'); replacements.class = student.class; }
  if (student.gender !== undefined) { fields.push('gender = :gender'); replacements.gender = student.gender; }
  if (student.date_of_birth !== undefined) { fields.push('date_of_birth = :date_of_birth'); replacements.date_of_birth = student.date_of_birth; }

  if (fields.length === 0) return findById(id);

  const sql = `UPDATE students SET ${fields.join(', ')} WHERE student_id = :id`;
  await sequelize.query(sql, { replacements });
  return findById(id);
}

async function remove(id) {
  const result = await sequelize.query('DELETE FROM students WHERE student_id = :id', {
    replacements: { id }
  });
  // Can't easily determine affectedRows; attempt to confirm deletion
  const row = await findById(id);
  return row === null;
}

module.exports = { findAll, findById, create, update, remove };
