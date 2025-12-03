import api from './client'

// frontend/src/api/scheduleService.js
export async function getAllSchedules() {
  try {
    const res = await api.get('/schedules')
    const d = res.data
    // Normalize to a flat array regardless of backend envelope
    const arr = Array.isArray(d)
      ? d
      : (d && typeof d === 'object')
        ? (Array.isArray(d.items) ? d.items : Array.isArray(d.rows) ? d.rows : [])
        : []
    return arr
  } catch (err) {
    console.error('Lỗi khi fetch schedules:', err)
    // Propagate error so screens can show notify/error states
    throw err
  }
}

// Helper: get a default driver id (first available) when UI doesn't choose one
async function getDefaultDriverId() {
  // Try /drivers first (recommended), then fallback to /users?roleId=2
  try {
    const res = await api.get('/drivers', { params: { page: 0, size: 1 } })
    const d = res.data
    const arr = Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : [])
    const u = arr[0]
    const id = u?.userId ?? u?.user_id ?? u?.driverId ?? u?.driver_id
    if (id) return id
  } catch {
    // ignore if /drivers not available
  }
  try {
    const res = await api.get('/users', { params: { roleId: 2, page: 0, size: 1 } })
    const d = res.data
    const arr = Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : [])
    const u = arr[0]
    const id = u?.userId ?? u?.user_id
    if (id) return id
  } catch {
    // ignore if /users?roleId=2 fallback not available
  }
  throw new Error('No driver found to assign')
}

const toHHmm = (val) => {
  if (!val) return ''
  if (typeof val === 'string') {
    const m = val.match(/^\s*(\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,9})?)?.*$/)
    if (m) return `${m[1]}:${m[2]}`
  }
  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  }
  return ''
}

// Create a schedule (maps UI form to backend payload)
export async function createSchedule(input) {
  const driverId = input.driver_id || (await getDefaultDriverId())
  const payload = {
    routeId: Number(input.route_id),
    busId: Number(input.bus_id),
    driverId,
    startTime: toHHmm(input.start_time),
    endTime: toHHmm(input.end_time),
    active: input.status ? String(input.status).toUpperCase() !== 'INACTIVE' : true,
  }
  const res = await api.post('/schedules', payload)
  return res.data
}

// Update a schedule
export async function updateSchedule(id, patch) {
  const payload = {
    ...(patch.route_id != null ? { routeId: Number(patch.route_id) } : {}),
    ...(patch.bus_id != null ? { busId: Number(patch.bus_id) } : {}),
    ...(patch.driver_id != null ? { driverId: Number(patch.driver_id) } : {}),
    ...(patch.start_time != null ? { startTime: toHHmm(patch.start_time) } : {}),
    ...(patch.end_time != null ? { endTime: toHHmm(patch.end_time) } : {}),
    ...(patch.status != null ? { active: String(patch.status).toUpperCase() !== 'INACTIVE' } : {}),
  }
  const res = await api.put(`/schedules/${id}`, payload)
  return res.data
}

// Delete a schedule by id
export async function deleteSchedule(id) {
  await api.delete(`/schedules/${id}`)
  return true
}
