// src/api/routeService.js
import api from './client'

/**
 * Helper: unwrap envelope { message, success, data }
 */
function unwrapResponse(res) {
  if (!res) return res
  if (res.data && Object.prototype.hasOwnProperty.call(res.data, 'data')) {
    return res.data.data
  }
  return res.data
}

/**
 * GET /routes → trả kèm stops nếu backend có
 */
export async function listRoutes() {
  const res = await api.get('/routes')
  const payload = unwrapResponse(res)

  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : []

  // Nếu backend đã include stops → trả thẳng
  if (items.length && items[0].Stops) return items

  // Nếu backend KHÔNG trả kèm stops → join thủ công từ /stops
  const stopsRes = await api.get('/stops').catch(() => ({ data: [] }))
  const stopsPayload = unwrapResponse(stopsRes)
  const stopItems = Array.isArray(stopsPayload)
    ? stopsPayload
    : Array.isArray(stopsPayload?.items)
      ? stopsPayload.items
      : []

  return items.map((r) => ({
    ...r,
    stops: stopItems
      .filter((s) => (s.routeId ?? s.route_id) === (r.routeId ?? r.route_id))
      .sort((a, b) =>
        (a.seqIndex ?? a.seq_index ?? 0) - (b.seqIndex ?? b.seq_index ?? 0)
      ),
  }))
}

/** POST /routes */
export async function createRoute(input) {
  const res = await api.post('/routes', input)
  return unwrapResponse(res)
}

/** PUT /routes/:id */
export async function updateRoute(id, patch) {
  const res = await api.put(`/routes/${id}`, patch)
  return unwrapResponse(res)
}

/** DELETE /routes/:id */
export async function deleteRoute(id) {
  const res = await api.delete(`/routes/${id}`)
  const payload = unwrapResponse(res)
  return payload === undefined ? true : payload
}
