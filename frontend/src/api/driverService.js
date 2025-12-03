// frontend/src/api/driverService.js
import api from './client'

/**
 * Chuẩn hóa dữ liệu driver từ backend (hỗ trợ nhiều kiểu tên trường)
 */
function normalizeDriver(u) {
  const userId = u.userId ?? u.user_id ?? u.driver_id
  const locked = u.locked ?? (u.is_active === false ? true : undefined)

  return {
    user_id: userId,
    role_id: u.roleId ?? u.role_id ?? 2,
    name: u.name,
    phone_number: u.phoneNumber ?? u.phone_number ?? u.phone,
    email: u.email,
    is_active: locked === undefined ? (u.is_active ?? true) : !locked,
    // đọc số GPLX từ nhiều khả năng
    license_number: u.license_number ?? u.licenseNumber ?? u.driverInfo?.licenseNumber ?? '',
  }
}

// --- Local cache để lưu GPLX cho tài xế mới tạo (không sửa backend) ---
const LICENSE_CACHE_KEY = 'driverLicenseCache'

function readLicenseCache() {
  try {
    const raw = localStorage.getItem(LICENSE_CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeLicenseCache(map) {
  try {
    localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify(map || {}))
  } catch {
    // ignore write error
  }
}

function cacheLicense(userId, license) {
  if (!userId) return
  const map = readLicenseCache()
  if (license && String(license).trim()) map[userId] = String(license).trim()
  else delete map[userId]
  writeLicenseCache(map)
}

function getCachedLicense(userId) {
  const map = readLicenseCache()
  return map[userId]
}

function mapAndFilter(d, q) {
  const items = Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : []
  const mapped = items.map(normalizeDriver)

  const s = q?.toLowerCase?.() || ''
  if (!s) return mapped
  return mapped.filter((r) =>
    r.name?.toLowerCase().includes(s) ||
    r.phone_number?.toLowerCase?.().includes(s) ||
    r.email?.toLowerCase?.().includes(s) ||
    r.license_number?.toLowerCase?.().includes(s)
  )
}

// Tạo mật khẩu mặc định cho tài xế mới (backend bắt buộc password)
function generatePassword(input = {}) {
  const phone = String(input.phone_number || '').replace(/\D/g, '')
  const emailUser = String(input.email || '').split('@')[0]
  return (
    input.password ||
    (phone && phone.length >= 6 ? phone : null) ||
    (emailUser && emailUser.length >= 6 ? emailUser : null) ||
    '123456'
  )
}

/**
 * Lấy danh sách drivers
 * Ưu tiên GET /drivers (có license_number); fallback /users?roleId=2 nếu API cũ
 */
export async function listDrivers(q = '') {
  // Step 1: try to get the driver list (users with role_id=2)
  let items = []
  try {
    const res = await api.get('/drivers', { params: { page: 0, size: 100 } })
    items = mapAndFilter(res.data, '')
  } catch {
    const res = await api.get('/users', { params: { roleId: 2, page: 0, size: 100 } })
    items = mapAndFilter(res.data, '')
  }

  // Step 2: enrich each row with driver details (licenseNumber) using /users/:id
  // Backend list endpoints do not include Driver association, but /users/:id does.
  const enriched = await Promise.all(items.map(async (row) => {
    try {
      const detail = await api.get(`/users/${row.user_id}`)
      const n = normalizeDriver(detail.data)
      // Ưu tiên dữ liệu backend, nếu thiếu thì dùng cache local
      const cached = getCachedLicense(row.user_id)
      return { ...row, license_number: n.license_number || cached || '' }
    } catch {
      const cached = getCachedLicense(row.user_id)
      return { ...row, license_number: row.license_number || cached || '' }
    }
  }))

  // Step 3: apply search filtering on the enriched data
  return mapAndFilter(enriched, q)
}

/**
 * Chuẩn hóa payload gửi lên backend /drivers
 */
function toUserPayload(input) {
  return {
    roleId: 2,
    name: input.name?.trim(),
    phoneNumber: input.phone_number?.trim() || undefined,
    email: input.email?.trim() || undefined,
    // backend dùng locked, UI dùng is_active
    locked: input.is_active === false,
  }
}

/**
 * Tạo driver mới
 * POST /drivers
 */
export async function createDriver(input) {
  // Backend does not expose POST /drivers; create a user with roleId=2 instead.
  const payload = { ...toUserPayload(input), password: generatePassword(input) }
  const res = await api.post('/users', payload)
  const created = res.data
  // Lưu GPLX vào cache cục bộ để hiển thị ngay
  const newId = created.userId || created.user_id
  if (newId && input.license_number) cacheLicense(newId, input.license_number)
  // Try to enrich with license (if a detail endpoint starts to return it later)
  try {
    const detail = await api.get(`/users/${created.userId || created.user_id}`)
    const n = normalizeDriver(detail.data)
    return { ...n, license_number: n.license_number || input.license_number || getCachedLicense(newId) || '' }
  } catch {
    const n = normalizeDriver(created)
    return { ...n, license_number: input.license_number || getCachedLicense(newId) || '' }
  }
}

/**
 * Cập nhật driver
 * PUT /drivers/:id
 */
export async function updateDriver(userId, patch) {
  // Update basic user fields; licenseNumber cannot be updated without backend support
  const res = await api.put(`/users/${userId}`, toUserPayload(patch))
  // Cập nhật cache GPLX nếu người dùng chỉnh sửa
  if (patch && Object.prototype.hasOwnProperty.call(patch, 'license_number')) {
    cacheLicense(userId, patch.license_number)
  }
  try {
    const detail = await api.get(`/users/${userId}`)
    const n = normalizeDriver(detail.data)
    return { ...n, license_number: n.license_number || getCachedLicense(userId) || '' }
  } catch {
    const n = normalizeDriver(res.data)
    return { ...n, license_number: getCachedLicense(userId) || n.license_number || '' }
  }
}

/**
 * Xóa driver
 * DELETE /drivers/:id
 */
export async function deleteDriver(userId) {
  // Delete the user (role=driver). Backend doesn't expose DELETE /drivers.
  await api.delete(`/users/${userId}`)
  cacheLicense(userId, null)
  return true
}