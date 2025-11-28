import axios from 'axios'

// Prefer VITE_BASE_API_URL, fall back to VITE_API_BASE_URL
const API_BASE = import.meta.env.VITE_BASE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

// Derive the origin (protocol + host) from API_BASE to access non-versioned routes like /auth
let ORIGIN_BASE = 'http://localhost:5000'
try {
  const u = new URL(API_BASE)
  ORIGIN_BASE = `${u.protocol}//${u.host}`
} catch {
  // keep default
}

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
