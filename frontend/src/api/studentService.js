// frontend/src/api/studentService.js
import api from './client'

/**
 * Chuẩn hóa dữ liệu student từ backend
 */
function normalizeStudent(s) {
  return {
    student_id: s.studentId ?? s.student_id ?? s.id,
    parent_id: s.parentId ?? s.parent_id,
    class_id: s.classId ?? s.class_id,
    name: s.name,
    gender: s.gender,
    date_of_birth: s.dateOfBirth ?? s.date_of_birth,
    class: s.class?.name ?? s.className ?? s.class,
  }
}

/**
 * Lấy danh sách students
 * GET /students?q=name
 */
export async function listStudents(q = '') {
  const res = await api.get('/students', {
    params: q ? { q } : {}
  })

  const d = res.data
  const items = Array.isArray(d)
    ? d
    : Array.isArray(d?.items)
      ? d.items
      : []

  const mapped = items.map(normalizeStudent)

  const s = q?.toLowerCase?.() || ''
  return s ? mapped.filter((r) => r.name.toLowerCase().includes(s)) : mapped
}

/**
 * Tạo student mới
 * POST /students
 */
export async function createStudent(input) {
  const payload = {
    parentId: input.parentId ?? input.parent_id,
    classId: input.classId ?? input.class_id,
    name: input.name,
    gender: input.gender,
    dateOfBirth: input.dateOfBirth ?? input.date_of_birth,
  }
  const res = await api.post('/students', payload)
  return res.data
}

/**
 * Cập nhật student
 * PUT /students/:id
 */
export async function updateStudent(id, patch) {
  const payload = {
    parentId: patch.parentId ?? patch.parent_id,
    classId: patch.classId ?? patch.class_id,
    name: patch.name,
    gender: patch.gender,
    dateOfBirth: patch.dateOfBirth ?? patch.date_of_birth,
  }
  const res = await api.put(`/students/${id}`, payload)
  return res.data
}

/**
 * Xóa student
 * DELETE /students/:id
 */
export async function deleteStudent(id) {
  await api.delete(`/students/${id}`)
  return true
}
