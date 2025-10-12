const repo = require('../repositories/studentsRepository');

function validateStudentPayload(payload) {
  const errors = [];
  if (!payload.parent_id) errors.push('parent_id is required');
  if (!payload.name) errors.push('name is required');
  // class, gender, date_of_birth are optional
  return errors;
}

async function listStudents() {
  return repo.findAll();
}

async function getStudent(id) {
  const s = await repo.findById(id);
  if (!s) {
    const err = new Error('Student not found'); err.status = 404; throw err;
  }
  return s;
}

async function createStudent(payload) {
  const errors = validateStudentPayload(payload);
  if (errors.length) { const err = new Error(errors.join('; ')); err.status = 400; throw err; }
  return repo.create(payload);
}

async function updateStudent(id, payload) {
  // allow partial updates
  const s = await repo.findById(id);
  if (!s) { const err = new Error('Student not found'); err.status = 404; throw err; }
  return repo.update(id, payload);
}

async function deleteStudent(id) {
  const s = await repo.findById(id);
  if (!s) { const err = new Error('Student not found'); err.status = 404; throw err; }
  const ok = await repo.remove(id);
  return ok;
}

module.exports = { listStudents, getStudent, createStudent, updateStudent, deleteStudent };
