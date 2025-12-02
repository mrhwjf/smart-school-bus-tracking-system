import api from './client'

/**
 * Chuẩn hóa dữ liệu bus từ backend
 */
function normalizeBus(b) {
  return {
    bus_id: b.busId ?? b.bus_id ?? b.id,
    plate_number: b.plateNumber ?? b.plate_number,
    model: b.model,
    status: b.status, // ACTIVE|INACTIVE|MAINTENANCE|OUT_OF_SERVICE
    capacity: b.capacity,
  }
}

/**
 * Lấy danh sách buses
 * GET /buses?q=search_term
 */
export async function listBuses(q = '') {
  const res = await api.get('/buses', { params: q ? { q } : {} })
  const d = res.data
  const items = Array.isArray(d)
    ? d
    : Array.isArray(d?.items)
      ? d.items
      : []

  const mapped = items.map(normalizeBus)

  const s = q?.toLowerCase?.() || ''
  return s ? mapped.filter((r) =>
    String(r.plate_number).toLowerCase().includes(s) ||
    String(r.model).toLowerCase().includes(s)
  ) : mapped
}

/**
 * Tạo bus mới
 * POST /buses
 */
export async function createBus(input) {
  const payload = {
    plateNumber: input.plateNumber ?? input.plate_number ?? input.plate,
    model: input.model,
    status: input.status,
    capacity: input.capacity,
  }
  const res = await api.post('/buses', payload)
  return normalizeBus(res.data)
}

/**
 * Cập nhật bus
 * PUT /buses/:id
 */
export async function updateBus(id, patch) {
  const payload = {
    plateNumber: patch.plateNumber ?? patch.plate_number ?? patch.plate,
    model: patch.model,
    status: patch.status,
    capacity: patch.capacity,
  }
  const res = await api.put(`/buses/${id}`, payload)
  return normalizeBus(res.data)
}

/**
 * Xóa bus
 * DELETE /buses/:id
 */
export async function deleteBus(id) {
  await api.delete(`/buses/${id}`)
  return true
}
