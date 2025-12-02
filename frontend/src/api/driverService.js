// frontend/src/api/driverService.js
import api from './client'

/**
 * Chuẩn hóa dữ liệu driver từ backend
 */
function normalizeDriver(u) {
  return {
    user_id: u.userId ?? u.user_id,
    role_id: u.roleId ?? u.role_id,
    name: u.name,
    phone_number: u.phoneNumber ?? u.phone_number,
    email: u.email,
    is_active: !(u.locked === true),
    license_number: u.driverInfo?.licenseNumber ?? '',
  }
}

/**
 * Lấy danh sách drivers
 * GET /users?roleId=2
 */
export async function listDrivers(q = '') {
  const res = await api.get('/users', {
    params: { roleId: 2, page: 0, size: 100 }
  })

  const d = res.data
  const items = Array.isArray(d)
    ? d
    : Array.isArray(d?.items)
      ? d.items
      : []

  const mapped = items.map(normalizeDriver)

  // Search filter
  const s = q?.toLowerCase?.() || ''
  return s ? mapped.filter((r) => r.name.toLowerCase().includes(s)) : mapped
}

/**
 * Tạo driver mới
 * POST /drivers
 */
export async function createDriver(input) {
  const res = await api.post('/drivers', input)
  return res.data
}

/**
 * Cập nhật driver
 * PUT /drivers/:id
 */
export async function updateDriver(userId, patch) {
  const res = await api.put(`/drivers/${userId}`, patch)
  return res.data
}

/**
 * Xóa driver
 * DELETE /drivers/:id
 */
export async function deleteDriver(userId) {
  await api.delete(`/drivers/${userId}`)
  return true
}
