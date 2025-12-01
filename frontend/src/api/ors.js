import axios from 'axios'

const ORS_BASE = 'https://api.openrouteservice.org'

function headers() {
  const key = import.meta.env.VITE_ORS_API_KEY
  return {
    Authorization: key,
    'Content-Type': 'application/json',
  }
}

export async function getDirections(coordinates, profile = 'driving-car', extras = {}) {
  // coordinates: [[lng, lat], [lng, lat], ...]
  const url = `${ORS_BASE}/v2/directions/${profile}/geojson`
  const body = { coordinates, ...extras }
  const res = await axios.post(url, body, { headers: headers() })
  return res.data
}

export async function getIsochrones(locations, range = [600], profile = 'driving-car', extras = {}) {
  const url = `${ORS_BASE}/v2/isochrones/${profile}`
  const body = { locations, range, ...extras }
  const res = await axios.post(url, body, { headers: headers() })
  return res.data
}

export default { getDirections, getIsochrones }
