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
