/**
 * ==============================================
 * FRONTEND API SERVICES
 * ==============================================
 * File này chứa tất cả các service functions để gọi API từ frontend
 * 
 * KIẾN TRÚC:
 * - Sử dụng axios client đã được cấu hình trong client.js
 * - Có fallback mechanism: nếu API fail → dùng mock data
 * - Normalize data: chuyển đổi giữa camelCase (backend) và snake_case (frontend)
 * 
 * LƯU Ý:
 * - Backend PHẢI trả về format: { success: boolean, data: any, message: string }
 * - Response interceptor trong client.js sẽ tự động unwrap: res.data = res.data.data
 */

import api, { authApi } from './client'
// Mock data is only used in DEV fallback paths. Avoid importing in production builds.
let users, drivers, students, buses, routes, stops, trips, trip_stops, trip_passengers, messages, navigation_logs
try {
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    ({
      users,
      drivers,
      students,
      buses,
      routes,
      stops,
      trips,
      trip_stops,
      trip_passengers,
      messages,
      navigation_logs,
    } = await import('./mockData'))
  }
} catch {
  // noop in production builds where mockData isn't available
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Simulate network delay cho fallback responses
 * @param {number} ms - Milliseconds to delay
 */
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

/**
 * Safe API call với fallback mechanism
 * @param {Function} fn - Async function gọi API thực
 * @param {any|Function} fallback - Mock data hoặc function trả về mock data
 * @returns {Promise<any>} - API response hoặc fallback data
 */
const safeApi = async (fn, fallback) => {
  try {
    // Thử gọi API thực
    return await fn()
  } catch (err) {
    // Nếu API fail: chỉ fallback khi đang ở DEV. PROD sẽ throw để UI thấy lỗi thay vì dữ liệu giả.
    const isDev = (typeof import.meta !== 'undefined' && import.meta.env?.DEV) || (typeof window !== 'undefined' && window?.SSB_DEV_FALLBACK === true)
    if (isDev) {
      console.warn('[API FALLBACK: DEV]', err?.message || err)
      await delay() // Simulate network delay
      return typeof fallback === 'function' ? fallback() : fallback
    }
    // Production: bubble up the error
    throw err
  }
}

// ==============================================
// ADMIN SERVICE
// ==============================================

export const AdminService = {
  // --- helpers (memoized) to fetch route-level resources ---
  _routeStopsCache: new Map(),
  _routePassengersCache: new Map(),
  async _getRouteStops(routeId) {
    if (!routeId) return []
    if (this._routeStopsCache.has(routeId)) return this._routeStopsCache.get(routeId)
    const data = await api.get(`/routes/${routeId}/stops`).then((r) => {
      const d = r.data
      const arr = Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : [])
      const mapped = arr.map((s) => {
        // Support both flat stop fields and nested { stop: {...} }
        const stop = s.stop || s.Stop || null
        return {
          stop_id: s.stop_id ?? s.stopId ?? stop?.stopId ?? stop?.stop_id ?? s.id,
          name: s.name ?? stop?.name ?? '',
          latitude: Number(s.latitude ?? stop?.latitude),
          longitude: Number(s.longitude ?? stop?.longitude),
          address: (s.address ?? stop?.address) || '',
          stop_order: s.stop_order ?? s.stopOrder ?? s.seq_index ?? s.seqIndex ?? 0,
        }
      })
      .filter((x) => typeof x.latitude === 'number' && typeof x.longitude === 'number')
      .sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0))
      return mapped
    }).catch(async () => {
      // Fallback: get route detail which includes ordered stops
      try {
        const r2 = await api.get(`/routes/${routeId}`)
        const route = r2?.data || {}
        const stops = Array.isArray(route?.stops) ? route.stops : []
        return stops
          .map((s, idx) => ({
            stop_id: s.stop_id ?? s.stopId ?? s.id,
            name: s.name,
            latitude: Number(s.latitude),
            longitude: Number(s.longitude),
            address: s.address ?? '',
            stop_order: s.stop_order ?? s.stopOrder ?? idx,
          }))
          .sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0))
      } catch {
        return []
      }
    })
    this._routeStopsCache.set(routeId, data)
    return data
  },

  /**
   * Đơn giản: lấy toàn bộ schedules cho Tracking
   * API: GET /schedules
   * Trả về dữ liệu raw như backend (đã được interceptor unwrap nếu có)
   */
  async getAllSchedules() {
    try {
      const res = await api.get('/schedules')
      return res.data
    } catch (err) {
      console.error('Lỗi khi fetch schedules:', err)
      return null
    }
  },
  async _getRoutePassengers(routeId) {
    if (!routeId) return []
    if (this._routePassengersCache.has(routeId)) return this._routePassengersCache.get(routeId)
    const data = await api.get(`/routes/${routeId}/passengers`).then((r) => {
      const d = r.data
      const arr = Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : [])
      return arr
    }).catch(() => [])
    this._routePassengersCache.set(routeId, data)
    return data
  },
  /**
   * Authenticate user (dev fallback)
   * role: 'admin' | 'driver' | 'parent'
   * values: form values from login
   * Returns { success, token, user }
   */
  
  async login(role, values) {
    // Try backend auth endpoint first (server expects { email | phone, password })
    try {
      const identifier = values.identifier ?? values.username ?? values.phone ?? values.driverId
      const password = values.password
      const id = String(identifier || '').trim()
      const payload = /@/.test(id)
        ? { email: id.toLowerCase(), password }
        : { phone: id, password }

      // IMPORTANT: /auth lives at root, not under /api/v1
      const res = await authApi.post('/auth/login', payload)

      // Backend uses session; no JWT token is returned. Keep a placeholder token for client state.
      return { success: true, token: 'session', user: res.data?.user || null }
    } catch (err) {
      // If server responded with a client error (e.g. 400/401), optionally use dev fallback
      const status = err?.response?.status
      const allowFallback = (typeof import.meta !== 'undefined' && import.meta.env?.DEV) || (typeof window !== 'undefined' && window?.SSB_DEV_AUTH_FALLBACK)
      if (err && err.response && !(allowFallback && (status === 400 || status === 401))) {
        const msg = err.response.data?.message || err.response.data?.error || err.response?.statusText || 'Authentication failed'
        return { success: false, message: msg }
      }

      // Fallback to mock checks if backend unavailable (network error / server down)
      await delay(200)
      const identifier = String(((values.identifier ?? values.username ?? values.phone ?? values.driverId) || '')).trim()
      const password = String(values.password || '')
      const roleMap = { admin: 1, driver: 2, parent: 3 }
      const expectedRole = roleMap[role] || (typeof role === 'number' ? Number(role) : null)
      const user = users.find((u) => u.role_id === expectedRole && (String(u.email || '') === identifier || String(u.phone_number || '') === identifier || String(u.user_id) === identifier || String(u.name || '') === identifier))
      if (!user) return { success: false, message: 'Người dùng không tồn tại' }
      // Dev-friendly passwords list and permissive fallback in DEV mode
      const accepted = [
        'password', 'admin', 'admin123', '123456', '12345678',
        'hashed_admin_pw', 'hashed_driver_pw', 'hashed_parent_pw',
        `pass-${user.user_id}`,
      ]
      if ((password && accepted.includes(password)) || (allowFallback && password)) {
        return { success: true, token: `dev-${user.user_id}`, user }
      }
      return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' }
    }
  },
  /**
   * Lấy tổng quan dashboard (số lượng students, drivers, buses, routes)
   * API: GET /students, /drivers, /buses, /routes
   * @returns {Promise<{students: number, drivers: number, buses: number, routes: number}>}
   */
  async getOverview() {
    return safeApi(
      async () => {
        // Gọi song song 4 API endpoints
        const [stuRes, drvRes, busRes, routeRes] = await Promise.all([
          api.get('/students'),
          api.get('/drivers'),
          api.get('/buses'),
          api.get('/routes'),
        ])

        /**
         * Helper function: đếm số items từ response
         * Backend có thể trả về nhiều format khác nhau:
         * - Array trực tiếp: [...]
         * - Paginated object: { items: [...], totalElements: 100 }
         * - Custom format: { rows: [...] }
         */
        const countFrom = (r) => {
          if (r == null) return 0
          const d = r.data ?? r
          if (Array.isArray(d)) return d.length
          if (d && typeof d === 'object') {
            if (Array.isArray(d.items)) return d.items.length
            if (typeof d.totalElements === 'number') return d.totalElements
            if (Array.isArray(d.rows)) return d.rows.length
          }
          return 0
        }

        return {
          students: countFrom(stuRes),
          drivers: countFrom(drvRes),
          buses: countFrom(busRes),
          routes: countFrom(routeRes),
        }
      },
      // Fallback: đếm từ mock data
      () => ({
        students: students.length,
        drivers: drivers.length,
        buses: buses.length,
        routes: routes.length,
      }),
    )
  },

  /**
   * Lấy danh sách parents cho dropdown (chỉ lấy user_id và name)
   * API: GET /users?roleId=3&page=0&size=100
   * @returns {Promise<Array<{user_id: number, name: string}>>}
   */
  async listParentsDropdown() {
    return safeApi(
      async () => {
        const res = await api.get('/users', { params: { roleId: 3, page: 0, size: 100 } })
        const d = res.data
        // Xử lý cả array và paginated response
        const items = Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : [])

        // Normalize: backend có thể trả userId hoặc user_id
        return items.map((u) => ({
          user_id: u.userId ?? u.user_id,
          name: u.name,
        }))
      },
      // Fallback: filter mock users với role_id = 3 (PARENT)
      () => users.filter((u) => u.role_id === 3).map((u) => ({ user_id: u.user_id, name: u.name })),
    )
  },

  /**
   * Lấy danh sách classes cho dropdown
   * LƯU Ý: Backend không có endpoint /classes riêng
   * → Derive từ students data
   * API: GET /students?page=0&size=100
   * @returns {Promise<Array<{class_id: number, name: string}>>}
   */
  async listClassesDropdown() {
    return safeApi(
      async () => {
        const res = await api.get('/students', { params: { page: 0, size: 100 } })
        const d = res.data
        const items = Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : [])

        // Dùng Map để loại bỏ duplicate classes
        const map = new Map()
        items.forEach((it) => {
          const id = it.classId ?? it.class_id
          const name = it.class?.name ?? it.className ?? it.class
          if (id != null && !map.has(id)) {
            map.set(id, { class_id: id, name })
          }
        })
        return Array.from(map.values())
      },
      // Fallback: derive từ mock students
      () => {
        const map = new Map()
        students.forEach((s) => {
          const id = s.class_id ?? s.classId
          const name = s.class
          if (id != null && !map.has(id)) {
            map.set(id, { class_id: id, name })
          }
        })
        return Array.from(map.values())
      },
    )
  },

  /**
   * Lấy danh sách students với optional search query
   * API: GET /students?q=search_term
   * @param {string} q - Search query (tìm theo name)
   * @returns {Promise<Array<Student>>} - Danh sách students đã normalize
   */
  async listStudents(q = '') {
    return safeApi(
      async () => {
        const res = await api.get('/students', { params: q ? { q } : {} })
        const d = res.data
        const items = Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : [])

        /**
         * NORMALIZE DATA:
         * Backend DTO (camelCase) → Frontend (snake_case)
         * - studentId → student_id
         * - parentId → parent_id
         * - classId → class_id
         * - dateOfBirth → date_of_birth
         */
        return items.map((it) => ({
          student_id: it.studentId ?? it.student_id ?? it.id,
          parent_id: it.parentId ?? it.parent_id,
          class_id: it.classId ?? it.class_id,
          name: it.name,
          gender: it.gender,
          date_of_birth: it.dateOfBirth ?? it.date_of_birth,
          // Class name có thể nằm trong nested object hoặc flat field
          class: it.class?.name ?? it.className ?? it.class,
        }))
      },
      // Fallback: filter mock students theo name
      () => students.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())),
    )
  },

  /**
   * Tạo student mới
   * API: POST /students
   * @param {Object} input - Student data từ form
   * @param {number} input.parent_id - Parent user ID
   * @param {number} input.class_id - Class ID
   * @param {string} input.name - Student name
   * @param {string} input.gender - MALE|FEMALE|OTHER
   * @param {string} input.date_of_birth - YYYY-MM-DD format
   * @returns {Promise<Student>} - Created student
   */
  async createStudent(input) {
    return safeApi(
      async () => {
        /**
         * MAP FRONTEND → BACKEND:
         * Frontend form có thể dùng snake_case hoặc camelCase
         * Backend expect camelCase DTO
         */
        const payload = {
          parentId: input.parentId ?? input.parent_id ?? input.parent,
          classId: input.classId ?? input.class_id ?? input.class,
          name: input.name,
          gender: input.gender,
          dateOfBirth: input.dateOfBirth ?? input.date_of_birth,
        }
        const res = await api.post('/students', payload)
        return res.data
      },
      // Fallback: thêm vào mock array
      () => {
        const nextId = Math.max(0, ...students.map((s) => s.student_id)) + 1
        const row = { student_id: nextId, ...input }
        students.push(row)
        return row
      },
    )
  },

  /**
   * Cập nhật student
   * API: PUT /students/:id
   * @param {number} id - Student ID
   * @param {Object} patch - Fields to update
   * @returns {Promise<Student>} - Updated student
   */
  async updateStudent(id, patch) {
    return safeApi(
      async () => {
        const payload = {
          parentId: patch.parentId ?? patch.parent_id ?? patch.parent,
          classId: patch.classId ?? patch.class_id ?? patch.class,
          name: patch.name,
          gender: patch.gender,
          dateOfBirth: patch.dateOfBirth ?? patch.date_of_birth,
        }
        const res = await api.put(`/students/${id}`, payload)
        return res.data
      },
      // Fallback: update mock array
      () => {
        const idx = students.findIndex((s) => s.student_id === id)
        if (idx === -1) throw new Error('Student not found')
        students[idx] = { ...students[idx], ...patch }
        return students[idx]
      },
    )
  },

  /**
   * Xóa student
   * API: DELETE /students/:id
   * @param {number} id - Student ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteStudent(id) {
    return safeApi(
      async () => {
        await api.delete(`/students/${id}`)
        return true
      },
      // Fallback: xóa khỏi mock array
      () => {
        const idx = students.findIndex((s) => s.student_id === id)
        if (idx >= 0) students.splice(idx, 1)
        return true
      },
    )
  },

  /**
   * Lấy danh sách drivers
   * LƯU Ý: Backend không có endpoint /drivers riêng
   * → Dùng /users?roleId=2 và lấy driverInfo từ response
   * API: GET /users?roleId=2&page=0&size=100
   * @param {string} q - Search query
   * @returns {Promise<Array<Driver>>} - Danh sách drivers với license_number
   */
  async listDrivers(q = '') {
    return safeApi(
      async () => {
        const userRes = await api.get('/users', { params: { roleId: 2, page: 0, size: 100 } })
        const d = userRes.data
        const items = Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : [])

        /**
         * NORMALIZE DRIVER DATA:
         * Backend có thể có nested driverInfo object
         * - user.driverInfo.licenseNumber → license_number
         */
        const mapped = items.map((u) => ({
          user_id: u.userId ?? u.user_id,
          role_id: u.roleId ?? u.role_id,
          name: u.name,
          phone_number: u.phoneNumber ?? u.phone_number,
          email: u.email,
          is_active: !(u.locked === true), // locked = false → active = true
          license_number: u.driverInfo?.licenseNumber ?? '',
        }))

        // Filter theo search query
        const s = q?.toLowerCase?.() || ''
        return s ? mapped.filter((r) => String(r.name).toLowerCase().includes(s)) : mapped
      },
      // Fallback: join mock users và drivers tables
      () => {
        const driverUsers = users.filter((u) => u.role_id === 2)
        return driverUsers
          .map((u) => ({
            ...u,
            is_active: u.is_active ?? true,
            license_number: drivers.find((d) => d.driver_id === u.user_id)?.license_number,
          }))
          .filter((d) => d.name.toLowerCase().includes(q.toLowerCase()))
      },
    )
  },

  /**
   * Lấy danh sách buses
   * API: GET /buses?q=search_term
   * @param {string} q - Search query (plate_number hoặc model)
   * @returns {Promise<Array<Bus>>}
   */
  async listBuses(q = '') {
    return safeApi(
      async () => {
        const res = await api.get('/buses', { params: q ? { q } : {} })
        const d = res.data
        const items = Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : [])

        // Normalize bus data
        return items.map((it) => ({
          bus_id: it.busId ?? it.bus_id ?? it.id,
          plate_number: it.plateNumber ?? it.plate_number,
          model: it.model,
          status: it.status, // ACTIVE|INACTIVE|MAINTENANCE|OUT_OF_SERVICE
          capacity: it.capacity,
        }))
      },
      // Fallback: filter mock buses
      () => buses.filter((b) => {
        const s = q?.toLowerCase?.() || ''
        return !s || String(b.plate_number).toLowerCase().includes(s) || String(b.model).toLowerCase().includes(s)
      }),
    )
  },

  /**
   * Tạo bus mới
   * API: POST /buses
   * @param {Object} input - Bus data
   * @returns {Promise<Bus>}
   */
  async createBus(input) {
    return safeApi(
      async () => {
        const payload = {
          plateNumber: input.plateNumber ?? input.plate_number ?? input.plate,
          model: input.model,
          status: input.status,
          capacity: input.capacity,
        }
        const res = await api.post('/buses', payload)
        return res.data
      },
      // Fallback
      () => {
        const nextId = Math.max(0, ...buses.map((b) => b.bus_id)) + 1
        const row = {
          bus_id: nextId,
          plate_number: input.plate_number ?? input.plateNumber,
          model: input.model,
          status: input.status,
          capacity: input.capacity,
        }
        buses.push(row)
        return row
      },
    )
  },

  /**
   * Cập nhật bus
   * API: PUT /buses/:id
   */
  async updateBus(id, patch) {
    return safeApi(
      async () => {
        const payload = {
          plateNumber: patch.plateNumber ?? patch.plate_number ?? patch.plate,
          model: patch.model,
          status: patch.status,
          capacity: patch.capacity,
        }
        const res = await api.put(`/buses/${id}`, payload)
        return res.data
      },
      () => {
        const idx = buses.findIndex((b) => b.bus_id === id)
        if (idx === -1) throw new Error('Bus not found')
        buses[idx] = { ...buses[idx], ...patch }
        return buses[idx]
      },
    )
  },

  /**
   * Xóa bus
   * API: DELETE /buses/:id
   */
  async deleteBus(id) {
    return safeApi(
      async () => {
        await api.delete(`/buses/${id}`)
        return true
      },
      () => {
        const idx = buses.findIndex((b) => b.bus_id === id)
        if (idx >= 0) buses.splice(idx, 1)
        return true
      },
    )
  },

  /**
   * Lấy danh sách routes với stops
   * API: GET /routes, GET /stops
   * LƯU Ý: Nếu routes không include stops, phải fetch riêng và join
   * @returns {Promise<Array<Route>>} - Routes với stops array đã sort theo seq_index
   */
  async listRoutes() {
    return safeApi(
      async () => {
        const res = await api.get('/routes')
        const d = res.data
        const items = Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : [])

        // Nếu routes chưa có stops, fetch riêng
        if (items.length && !('stops' in items[0])) {
          const stopsRes = await api.get('/stops').catch(() => ({ data: [] }))
          const stopData = Array.isArray(stopsRes.data) ? stopsRes.data : (Array.isArray(stopsRes.data?.items) ? stopsRes.data.items : [])

          // Join routes với stops
          return items.map((r) => ({
            ...r,
            stops: stopData
              .filter((s) => (s.route_id ?? s.routeId) === (r.route_id ?? r.routeId))
              .sort((a, b) => (a.seq_index ?? a.seqIndex) - (b.seq_index ?? b.seqIndex)),
          }))
        }
        return items
      },
      // Fallback: join mock routes và stops
      () =>
        routes.map((r) => ({
          ...r,
          stops: stops.filter((s) => s.route_id === r.route_id).sort((a, b) => a.seq_index - b.seq_index),
        })),
    )
  },

  /**
   * Tạo route mới
   * API: POST /routes
   */
  async createRoute(input) {
    return safeApi(
      async () => (await api.post('/routes', input)).data,
      () => {
        const nextId = Math.max(0, ...routes.map((r) => r.route_id)) + 1
        const row = { route_id: nextId, name: '', description: '', ...input }
        routes.push(row)
        return row
      },
    )
  },

  /**
   * Cập nhật route
   * API: PUT /routes/:id
   */
  async updateRoute(id, patch) {
    return safeApi(
      async () => (await api.put(`/routes/${id}`, patch)).data,
      () => {
        const idx = routes.findIndex((r) => r.route_id === id)
        if (idx === -1) throw new Error('Route not found')
        routes[idx] = { ...routes[idx], ...patch }
        return routes[idx]
      },
    )
  },

  /**
   * Xóa route
   * API: DELETE /routes/:id
   * LƯU Ý: Cascade delete stops và trips liên quan
   */
  async deleteRoute(id) {
    return safeApi(
      async () => {
        await api.delete(`/routes/${id}`)
        return true
      },
      () => {
        const ridx = routes.findIndex((r) => r.route_id === id)
        if (ridx >= 0) routes.splice(ridx, 1)
        // Cascade delete
        for (let i = stops.length - 1; i >= 0; i--) {
          if (stops[i].route_id === id) stops.splice(i, 1)
        }
        for (let i = trips.length - 1; i >= 0; i--) {
          if (trips[i].route_id === id) trips.splice(i, 1)
        }
        return true
      },
    )
  },

  /**
   * Tạo stop mới cho route
   * API: POST /stops
   */
  async createStop(input) {
    return safeApi(
      async () => (await api.post('/stops', input)).data,
      () => {
        const nextId = Math.max(0, ...stops.map((s) => s.stop_id)) + 1
        const row = { stop_id: nextId, seq_index: 0, ...input }
        stops.push(row)
        return row
      },
    )
  },

  /**
   * Cập nhật stop
   * API: PUT /stops/:id
   */
  async updateStop(id, patch) {
    return safeApi(
      async () => (await api.put(`/stops/${id}`, patch)).data,
      () => {
        const idx = stops.findIndex((s) => s.stop_id === id)
        if (idx === -1) throw new Error('Stop not found')
        stops[idx] = { ...stops[idx], ...patch }
        return stops[idx]
      },
    )
  },

  /**
   * Xóa stop
   * API: DELETE /stops/:id
   */
  async deleteStop(id) {
    return safeApi(
      async () => {
        await api.delete(`/stops/${id}`)
        return true
      },
      () => {
        const idx = stops.findIndex((s) => s.stop_id === id)
        if (idx >= 0) stops.splice(idx, 1)
        // Cascade delete trip_stops
        for (let i = trip_stops.length - 1; i >= 0; i--) {
          if (trip_stops[i].stop_id === id) trip_stops.splice(i, 1)
        }
        return true
      },
    )
  },

  /**
   * Lấy danh sách trips với đầy đủ thông tin (route, bus, driver, stops, passengers)
   * API: GET /trips
   * @returns {Promise<Array<Trip>>} - Trips với nested objects
   */
  async listTrips() {
    return safeApi(
      async () => {
        const res = await api.get('/trips')
        const d = res.data
        const items = Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : [])

        /**
         * NORMALIZE TRIP DATA:
         * Backend có thể trả về schedules thay vì trips
         * - scheduleId → trip_id
         * - startTime → start_time
         * - shift → status label
         */
        // Pre-fetch stops and routes to enrich trips if backend doesn't include them
        const [routesRes, stopsRes] = await Promise.all([
          api.get('/routes').catch(() => ({ data: [] })),
          api.get('/stops').catch(() => ({ data: [] })),
        ])
        const routeData = Array.isArray(routesRes.data) ? routesRes.data : (Array.isArray(routesRes.data?.items) ? routesRes.data.items : [])
        const stopData = Array.isArray(stopsRes.data) ? stopsRes.data : (Array.isArray(stopsRes.data?.items) ? stopsRes.data.items : [])

        return items.map((t) => {
          const tripId = t.trip_id ?? t.tripId ?? t.id ?? t.schedule_id ?? t.scheduleId
          const routeId = t.route_id ?? t.routeId
          const busId = t.bus_id ?? t.busId
          const driverId = t.driver_id ?? t.driverId
          const routeObj = t.route || routeData.find((r) => (r.route_id ?? r.routeId) === routeId)
          const stopsForRoute = Array.isArray(t.stops) && t.stops.length
            ? [...t.stops]
            : stopData.filter((s) => (s.route_id ?? s.routeId) === routeId)
          return {
            trip_id: tripId,
            start_time: t.start_time ?? t.startTime ?? t.plannedStartTime ?? t.actualStartTime,
            end_time: t.end_time ?? t.endTime ?? t.plannedEndTime ?? t.actualEndTime,
            status: t.status ?? t.tripStatus ?? (t.shift ? 'SCHEDULED' : 'SCHEDULED'),
            ...t,
            route: routeObj || null,
            bus: t.bus ?? (typeof busId !== 'undefined' ? { bus_id: busId } : null),
            driver: t.driver ?? (typeof driverId !== 'undefined' ? { user_id: driverId } : null),
            stops: stopsForRoute
              .slice()
              .sort((a, b) => (a.stop_order ?? a.seq_index ?? a.seqIndex ?? 0) - (b.stop_order ?? b.seq_index ?? b.seqIndex ?? 0)),
            passengers: Array.isArray(t.passengers) ? t.passengers : [],
            shift_label: t.shift || null,
          }
        })
      },
      // Fallback: join mock data
      () =>
        trips.map((t) => {
          const routeObj = routes.find((r) => r.route_id === t.route_id)
          const busObj = buses.find((b) => b.bus_id === t.bus_id)
          const driverUser = users.find((u) => u.user_id === busObj?.driver_id)
          return {
            ...t,
            route: routeObj,
            bus: busObj,
            driver: driverUser,
            stops: trip_stops
              .filter((ts) => ts.trip_id === t.trip_id)
              .sort((a, b) => a.stop_order - b.stop_order)
              .map((ts) => stops.find((s) => s.stop_id === ts.stop_id)),
            passengers: trip_passengers
              .filter((tp) => tp.trip_id === t.trip_id)
              .map((tp) => students.find((s) => s.student_id === tp.student_id)),
          }
        }),
    )
  },

  /**
   * Lấy danh sách schedules (lịch lặp)
   * API: GET /schedules
   * Trả về items có: scheduleId, routeId, busId, driverId, shift, startTime, endTime, active
   */
  async listSchedules() {
    return safeApi(
      async () => {
        const res = await api.get('/schedules')
        const d = res.data
        const items = Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : [])
        // Normalize
        return items.map((s) => ({
          schedule_id: s.scheduleId ?? s.schedule_id ?? s.id,
          route_id: s.routeId ?? s.route_id,
          bus_id: s.busId ?? s.bus_id,
          driver_id: s.driverId ?? s.driver_id,
          shift: s.shift,
          start_time: s.startTime ?? s.start_time,
          end_time: s.endTime ?? s.end_time,
          active: s.active,
        }))
      },
      // No mock fallback in production
      () => ([]),
    )
  },

  /**
   * Tạo trip mới
   * API: POST /trips
   * @param {Object} input - Trip data với stop_ids và student_ids arrays
   */
  async createTrip(input) {
    return safeApi(
      async () => (await api.post('/trips', input)).data,
      () => {
        const nextId = Math.max(0, ...trips.map((t) => t.trip_id)) + 1
        const row = { trip_id: nextId, status: 'SCHEDULED', ...input }
        trips.push(row)

        // Tạo trip_stops
        if (Array.isArray(input.stop_ids)) {
          input.stop_ids.forEach((sid, i) => trip_stops.push({ trip_id: nextId, stop_id: sid, stop_order: i + 1 }))
        }

        // Tạo trip_passengers
        if (Array.isArray(input.student_ids)) {
          input.student_ids.forEach((sid) => trip_passengers.push({ trip_id: nextId, student_id: sid }))
        }

        return row
      },
    )
  },

  /**
   * Lấy trips hôm nay (cho dashboard)
   * API: GET /trips/today (nếu có) hoặc filter từ /trips
   * @returns {Promise<Array<Trip>>} - Max 6 trips gần nhất
   */
  async getTodayTrips() {
    return safeApi(
      async () => {
        const res = await api.get('/trips/today')
        return res.data
      },
      async () => {
        const list = await this.listTrips()
        const todayKey = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
        const isToday = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) === todayKey : false)

        // Filter trips hôm nay
        let result = list.filter((t) => isToday(t.start_time)).sort((a, b) => new Date(a.start_time) - new Date(b.start_time))

        // Nếu không có trips hôm nay, lấy 6 trips gần nhất
        if (result.length === 0) {
          result = [...list].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)).slice(0, 6)
        }

        return result
      },
    )
  },

  /**
   * Lấy alerts/notifications gần nhất (cho dashboard)
   * API: GET /notifications
   * @returns {Promise<Array<Alert>>} - Max 3 alerts với severity
   */
  async getAlerts() {
    return safeApi(
      async () => {
        const res = await api.get('/notifications')
        const list = res.data

        /**
         * Derive severity từ message text
         * - error: trễ, muộn, chưa, lỗi, sự cố, offline
         * - warning: cảnh báo, đông, tắc, chậm
         * - info: default
         */
        const score = (text) => {
          const lower = (text || '').toLowerCase()
          if (/(trễ|muộn|chưa|lỗi|sự cố|offline)/.test(lower)) return 'error'
          if (/(cảnh báo|đông|tắc|chậm)/.test(lower)) return 'warning'
          return 'info'
        }

        return (Array.isArray(list) ? list : []).slice(0, 3).map((m) => ({
          id: m.notification_id || m.id,
          text: m.message || m.message_text || m.text,
          sent_at: m.sent_at || m.created_at,
          severity: score(m.message || m.message_text || ''),
          highlight: /(chưa có mặt|khẩn cấp|sự cố)/i.test(m.message || m.message_text || ''),
        }))
      },
      // Fallback: từ mock messages
      () => {
        const score = (text) => {
          const lower = (text || '').toLowerCase()
          if (/(trễ|muộn|chưa|lỗi|sự cố|offline)/.test(lower)) return 'error'
          if (/(cảnh báo|đông|tắc|chậm)/.test(lower)) return 'warning'
          return 'info'
        }
        const latest = [...messages]
          .sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at))
          .slice(0, 3)
          .map((m) => ({
            id: m.message_id,
            text: m.message_text,
            sent_at: m.sent_at,
            severity: score(m.message_text),
            highlight: /(chưa có mặt|khẩn cấp|sự cố)/i.test(m.message_text || ''),
          }))
        return latest
      },
    )
  },

  /**
   * Cập nhật trip
   * API: PUT /trips/:id
   * @param {Object} patch - Có thể update stop_ids và student_ids
   */
  async updateTrip(id, patch) {
    return safeApi(
      async () => (await api.put(`/trips/${id}`, patch)).data,
      () => {
        const idx = trips.findIndex((t) => t.trip_id === id)
        if (idx === -1) throw new Error('Trip not found')
        trips[idx] = { ...trips[idx], ...patch }

        // Update trip_stops nếu có
        if (patch.stop_ids) {
          for (let i = trip_stops.length - 1; i >= 0; i--) {
            if (trip_stops[i].trip_id === id) trip_stops.splice(i, 1)
          }
          patch.stop_ids.forEach((sid, i) => trip_stops.push({ trip_id: id, stop_id: sid, stop_order: i + 1 }))
        }

        // Update trip_passengers nếu có
        if (patch.student_ids) {
          for (let i = trip_passengers.length - 1; i >= 0; i--) {
            if (trip_passengers[i].trip_id === id) trip_passengers.splice(i, 1)
          }
          patch.student_ids.forEach((sid) => trip_passengers.push({ trip_id: id, student_id: sid }))
        }

        return trips[idx]
      },
    )
  },

  /**
   * Xóa trip
   * API: DELETE /trips/:id
   */
  async deleteTrip(id) {
    return safeApi(
      async () => {
        await api.delete(`/trips/${id}`)
        return true
      },
      () => {
        const idx = trips.findIndex((t) => t.trip_id === id)
        if (idx >= 0) trips.splice(idx, 1)

        // Cascade delete
        for (let i = trip_stops.length - 1; i >= 0; i--) {
          if (trip_stops[i].trip_id === id) trip_stops.splice(i, 1)
        }
        for (let i = trip_passengers.length - 1; i >= 0; i--) {
          if (trip_passengers[i].trip_id === id) trip_passengers.splice(i, 1)
        }

        return true
      },
    )
  },

  /**
   * Lấy danh sách messages/notifications
   * API: GET /notifications
   */
  async listMessages() {
    return safeApi(
      async () => {
        // Gọi đúng endpoint messages và chuẩn hóa dữ liệu về mảng
        const data = (await api.get('/messages')).data
        const arr = Array.isArray(data)
          ? data
          : (data && typeof data === 'object')
            ? (Array.isArray(data.items) ? data.items : Array.isArray(data.rows) ? data.rows : [])
            : []
        // Chuẩn hóa field names về snake_case để UI dùng chung cho cả mock và API
        return arr.map((m) => ({
          message_id: m.message_id ?? m.messageId,
          sender_id: m.sender_id ?? m.senderId ?? null,
          message_text: m.message_text ?? m.messageText,
          // Ưu tiên ISO, nếu là 'YYYY-MM-DD HH:mm:ss' thì giữ, UI sẽ xử lý
          sent_at: m.sent_at ?? m.sentAt ?? null,
        }))
      },
      // Fallback: dùng mock messages
      () => messages,
    )
  },

  /**
   * Lấy vị trí realtime của tất cả buses
   * API: GET /navigation-logs
   * @returns {Promise<Array<BusLocation>>} - Buses với lat/lng
   */
  async listBusLocations() {
    try {
      const res = await api.get('/navigation-logs')
      const data = res.data
      const arr = Array.isArray(data)
        ? data
        : (data && typeof data === 'object')
          ? (Array.isArray(data.items) ? data.items : Array.isArray(data.rows) ? data.rows : [])
          : []
      return arr.map((n) => ({
        bus_id: n.bus_id ?? n.busId,
        plate_number: n.plate_number ?? n.plateNumber ?? null,
        status: n.status ?? null,
        capacity: n.capacity ?? null,
        latitude: n.latitude,
        longitude: n.longitude,
        recorded_at: n.recorded_at ?? n.recordedAt ?? null,
      }))
    } catch (err) {
      // If navigation logs endpoint does not exist (404), derive list from /buses
      if (err?.response?.status === 404) {
        const busRes = await api.get('/buses').catch(() => ({ data: [] }))
        const busesData = Array.isArray(busRes.data) ? busRes.data : (Array.isArray(busRes.data?.items) ? busRes.data.items : [])
        return busesData.map((b) => ({
          bus_id: b.bus_id ?? b.busId ?? b.id,
          plate_number: b.plate_number ?? b.plateNumber ?? null,
          status: b.status ?? null,
          capacity: b.capacity ?? null,
          latitude: null,
          longitude: null,
          recorded_at: null,
        }))
      }
      throw err
    }
  },
  async listSchedules() {
    return safeApi(
      async () => {
        const res = await api.get('/schedules')
        const data = res.data
        const arr = Array.isArray(data)
          ? data
          : (data && typeof data === 'object')
            ? (Array.isArray(data.items) ? data.items : Array.isArray(data.rows) ? data.rows : [])
            : []
        return arr.map((s) => ({
          schedule_id: s.schedule_id ?? s.scheduleId,
          route_id: s.route_id ?? s.routeId,
          bus_id: s.bus_id ?? s.busId,
          driver_id: s.driver_id ?? s.driverId,
          start_time: s.start_time ?? s.startTime,
          end_time: s.end_time ?? s.endTime,
          shift: s.shift,
          active: s.active,
          days: s.days,
        }))
      },
      () => [],
    )
  },
}

// ==============================================
// REALTIME SERVICE (WebSocket Simulation)
// ==============================================

/**
 * Simulate realtime bus location updates
 * Trong production, thay bằng Socket.IO hoặc WebSocket
 */
const listeners = new Set()

// Mock realtime movement only in DEV
if (typeof import.meta !== 'undefined' && import.meta.env?.DEV && Array.isArray(navigation_logs)) {
  setInterval(() => {
    const b1 = navigation_logs.find((n) => n.bus_id === 1)
    if (b1) {
      b1.longitude -= 0.0008
      b1.latitude += 0.0003
      b1.recorded_at = new Date().toISOString()
    }
    const b2 = navigation_logs.find((n) => n.bus_id === 2)
    if (b2) {
      b2.latitude -= 0.0006
      b2.longitude += 0.0004
      b2.recorded_at = new Date().toISOString()
    }
    const payload = navigation_logs
    listeners.forEach((cb) => cb(payload))
  }, 3000)
}

export const Realtime = {
  /**
   * Subscribe to realtime bus location updates
   * @param {Function} cb - Callback function (data) => void
   * @returns {Function} - Unsubscribe function
   * 
   * USAGE:
   * const unsubscribe = Realtime.subscribe((locations) => {
   *   console.log('Bus locations updated:', locations);
   *   // Update map markers
   * });
   * 
   * // Cleanup when component unmounts
   * useEffect(() => {
   *   return () => unsubscribe();
   * }, []);
   */
  subscribe(cb) {
    listeners.add(cb)
    if ((typeof import.meta !== 'undefined' && import.meta.env?.DEV) && Array.isArray(navigation_logs)) {
      cb(navigation_logs) // Initial mock data in DEV
    }
    return () => listeners.delete(cb) // Unsubscribe function
  },
}

// Helper export cho cách dùng đơn giản ở Tracking
export async function getAllSchedules() {
  return AdminService.getAllSchedules()
}