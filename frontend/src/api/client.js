import axios from 'axios'
import { API_ORIGIN, API_URL } from '../config/api'

const API_BASE = API_URL
const ORIGIN_BASE = API_ORIGIN

function createAxios(baseURL) {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false, // session-based auth not required for API v1 calls
  })

  // Attach bearer token when available
  instance.interceptors.request.use(
    (config) => {
      try {
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch {
        // ignore
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  // Unwrap standard { success, data } envelope when present
  instance.interceptors.response.use(
    (res) => {
      try {
        if (
          res &&
          res.data &&
          typeof res.data === 'object' &&
          Object.prototype.hasOwnProperty.call(res.data, 'success') &&
          Object.prototype.hasOwnProperty.call(res.data, 'data')
        ) {
          res.data = res.data.data
        }
      } catch {
        // ignore
      }
      return res
    },
    (err) => {
      console.error('[API ERROR]', err?.response?.data || err.message)
      return Promise.reject(err)
    },
  )

  return instance
}

// Main API for versioned endpoints (/api/v1/...)
export const api = createAxios(API_BASE)

// Auth API hits root-scoped routes like /auth/login
export const authApi = createAxios(ORIGIN_BASE)

// Request interceptor: attach bearer token when available
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // ignore
    }
    return config
  },
  (error) => Promise.reject(error),
)

  // Response interceptor: centralized error logging/handling
api.interceptors.response.use(
  (res) => {
    // Unwrap backend standard response format { message, success, data }
    try {
      if (res && res.data && typeof res.data === 'object' && Object.prototype.hasOwnProperty.call(res.data, 'success') && Object.prototype.hasOwnProperty.call(res.data, 'data')) {
        // replace res.data with the inner payload for client convenience
        res.data = res.data.data
      }
    } catch {
      // ignore
    }
    return res
  },
  (err) => {
    console.error('[API ERROR]', err?.response?.data || err.message)
    // Optionally handle 401 here (emit event / redirect to login)
    return Promise.reject(err)
  },
)

export default api
