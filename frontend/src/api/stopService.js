// src/api/stopService.js
import api from './client'

function unwrapResponse(res) {
  if (!res) return res
  if (res.data && Object.prototype.hasOwnProperty.call(res.data, 'data')) {
    return res.data.data
  }
  return res.data
}

/** POST /stops */
export async function createStop(input) {
  const res = await api.post('/stops', input)
  return unwrapResponse(res)
}

/** PUT /stops/:id */
export async function updateStop(id, patch) {
  const res = await api.put(`/stops/${id}`, patch)
  return unwrapResponse(res)
}

/** DELETE /stops/:id */
export async function deleteStop(id) {
  const res = await api.delete(`/stops/${id}`)
  const payload = unwrapResponse(res)
  return payload === undefined ? true : payload
}
