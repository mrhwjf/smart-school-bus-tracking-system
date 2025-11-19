import {
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
} from './mockData'

// Simulate network latency
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export const AdminService = {
  async getOverview() {
    await delay()
    return {
      students: students.length,
      drivers: drivers.length,
      buses: buses.length,
      routes: routes.length,
    }
  },
  async listStudents(q = '') {
    await delay()
    return students.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
  },
  async createStudent(input) {
    await delay()
    const nextId = Math.max(0, ...students.map((s) => s.student_id)) + 1
    const row = { student_id: nextId, ...input }
    students.push(row)
    return row
  },
  async updateStudent(id, patch) {
    await delay()
    const idx = students.findIndex((s) => s.student_id === id)
    if (idx === -1) throw new Error('Student not found')
    students[idx] = { ...students[idx], ...patch }
    return students[idx]
  },
  async deleteStudent(id) {
    await delay()
    const idx = students.findIndex((s) => s.student_id === id)
    if (idx >= 0) students.splice(idx, 1)
    return true
  },
  async listDrivers(q = '') {
    await delay()
    const driverUsers = users.filter((u) => u.role_id === 2)
    return driverUsers
      .map((u) => ({ ...u, license_number: drivers.find((d) => d.driver_id === u.user_id)?.license_number }))
      .filter((d) => d.name.toLowerCase().includes(q.toLowerCase()))
  },
  async createDriver(input) {
    await delay()
    const nextUserId = Math.max(0, ...users.map((u) => u.user_id)) + 1
    const user = {
      user_id: nextUserId,
      role_id: 2,
      name: input.name,
      phone_number: input.phone_number || '',
      email: input.email || '',
      is_active: input.is_active ?? true,
    }
    users.push(user)
    drivers.push({ driver_id: nextUserId, license_number: input.license_number || '' })
    return { ...user, license_number: input.license_number || '' }
  },
  async updateDriver(userId, patch) {
    await delay()
    const uidx = users.findIndex((u) => u.user_id === userId && u.role_id === 2)
    if (uidx === -1) throw new Error('Driver not found')
    users[uidx] = { ...users[uidx], ...patch }
    const didx = drivers.findIndex((d) => d.driver_id === userId)
    if (didx !== -1 && patch.license_number !== undefined) {
      drivers[didx] = { ...drivers[didx], license_number: patch.license_number }
    }
    return { ...users[uidx], license_number: drivers.find((d) => d.driver_id === userId)?.license_number }
  },
  async deleteDriver(userId) {
    await delay()
    const uidx = users.findIndex((u) => u.user_id === userId && u.role_id === 2)
    if (uidx >= 0) users.splice(uidx, 1)
    const didx = drivers.findIndex((d) => d.driver_id === userId)
    if (didx >= 0) drivers.splice(didx, 1)
    return true
  },
  async listBuses(q = '') {
    await delay()
    return buses.filter((b) => `${b.plate_number} ${b.model}`.toLowerCase().includes(q.toLowerCase()))
  },
  async createBus(input) {
    await delay()
    const nextId = Math.max(0, ...buses.map((b) => b.bus_id)) + 1
    const row = { bus_id: nextId, status: 'ACTIVE', capacity: 0, ...input }
    buses.push(row)
    return row
  },
  async updateBus(id, patch) {
    await delay()
    const idx = buses.findIndex((b) => b.bus_id === id)
    if (idx === -1) throw new Error('Bus not found')
    buses[idx] = { ...buses[idx], ...patch }
    return buses[idx]
  },
  async deleteBus(id) {
    await delay()
    const idx = buses.findIndex((b) => b.bus_id === id)
    if (idx >= 0) buses.splice(idx, 1)
    // detach from trips
    for (let i = trips.length - 1; i >= 0; i--) if (trips[i].bus_id === id) trips.splice(i, 1)
    return true
  },
  async listRoutes() {
    await delay()
    return routes.map((r) => ({
      ...r,
      stops: stops.filter((s) => s.route_id === r.route_id).sort((a, b) => a.seq_index - b.seq_index),
    }))
  },
  async createRoute(input) {
    await delay()
    const nextId = Math.max(0, ...routes.map((r) => r.route_id)) + 1
    const row = { route_id: nextId, name: '', description: '', ...input }
    routes.push(row)
    return row
  },
  async updateRoute(id, patch) {
    await delay()
    const idx = routes.findIndex((r) => r.route_id === id)
    if (idx === -1) throw new Error('Route not found')
    routes[idx] = { ...routes[idx], ...patch }
    return routes[idx]
  },
  async deleteRoute(id) {
    await delay()
    const ridx = routes.findIndex((r) => r.route_id === id)
    if (ridx >= 0) routes.splice(ridx, 1)
    // cascade delete stops
    for (let i = stops.length - 1; i >= 0; i--) if (stops[i].route_id === id) stops.splice(i, 1)
    // remove trips of this route
    for (let i = trips.length - 1; i >= 0; i--) if (trips[i].route_id === id) trips.splice(i, 1)
    return true
  },
  async createStop(input) {
    await delay()
    const nextId = Math.max(0, ...stops.map((s) => s.stop_id)) + 1
    const row = { stop_id: nextId, seq_index: 0, ...input }
    stops.push(row)
    return row
  },
  async updateStop(id, patch) {
    await delay()
    const idx = stops.findIndex((s) => s.stop_id === id)
    if (idx === -1) throw new Error('Stop not found')
    stops[idx] = { ...stops[idx], ...patch }
    return stops[idx]
  },
  async deleteStop(id) {
    await delay()
    const idx = stops.findIndex((s) => s.stop_id === id)
    if (idx >= 0) stops.splice(idx, 1)
    // remove from trip_stops
    for (let i = trip_stops.length - 1; i >= 0; i--) if (trip_stops[i].stop_id === id) trip_stops.splice(i, 1)
    return true
  },
  async listTrips() {
    await delay()
    return trips.map((t) => {
      const routeObj = routes.find((r) => r.route_id === t.route_id)
      const busObj = buses.find((b) => b.bus_id === t.bus_id)
      const driverUser = users.find((u) => u.user_id === (busObj?.driver_id))
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
    })
  },
  async createTrip(input) {
    await delay()
    const nextId = Math.max(0, ...trips.map((t) => t.trip_id)) + 1
    const row = { trip_id: nextId, status: 'SCHEDULED', ...input }
    trips.push(row)
    if (Array.isArray(input.stop_ids)) {
      input.stop_ids.forEach((sid, i) => trip_stops.push({ trip_id: nextId, stop_id: sid, stop_order: i + 1 }))
    }
    if (Array.isArray(input.student_ids)) {
      input.student_ids.forEach((sid) => trip_passengers.push({ trip_id: nextId, student_id: sid }))
    }
    return row
  },
  async getTodayTrips() {
    // Return trips for today by local date; if none, return next upcoming (max 6)
    await delay()
    const list = await this.listTrips()
    const todayKey = new Date().toISOString().slice(0, 10)
    const isToday = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) === todayKey : false)
    let result = list.filter((t) => isToday(t.start_time)).sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    if (result.length === 0) {
      result = [...list].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)).slice(0, 6)
    }
    return result
  },
  async getAlerts() {
    // Heuristic: derive severity from message content; return latest 3
    await delay()
    const score = (text) => {
      const lower = (text || '').toLowerCase()
      if (/(trễ|muộn|chưa|lỗi|sự cố|offline)/.test(lower)) return 'error'
      if (/(cảnh báo|đông|tắc|chậm)/.test(lower)) return 'warning'
      return 'info'
    }
    const latest = [...messages]
      .sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at))
      .slice(0, 3)
      .map((m) => ({ id: m.message_id, text: m.message_text, sent_at: m.sent_at, severity: score(m.message_text), highlight: /(chưa có mặt|khẩn cấp|sự cố)/i.test(m.message_text || '') }))
    return latest
  },
  async updateTrip(id, patch) {
    await delay()
    const idx = trips.findIndex((t) => t.trip_id === id)
    if (idx === -1) throw new Error('Trip not found')
    trips[idx] = { ...trips[idx], ...patch }
    if (patch.stop_ids) {
      for (let i = trip_stops.length - 1; i >= 0; i--) if (trip_stops[i].trip_id === id) trip_stops.splice(i, 1)
      patch.stop_ids.forEach((sid, i) => trip_stops.push({ trip_id: id, stop_id: sid, stop_order: i + 1 }))
    }
    if (patch.student_ids) {
      for (let i = trip_passengers.length - 1; i >= 0; i--) if (trip_passengers[i].trip_id === id) trip_passengers.splice(i, 1)
      patch.student_ids.forEach((sid) => trip_passengers.push({ trip_id: id, student_id: sid }))
    }
    return trips[idx]
  },
  async deleteTrip(id) {
    await delay()
    const idx = trips.findIndex((t) => t.trip_id === id)
    if (idx >= 0) trips.splice(idx, 1)
    for (let i = trip_stops.length - 1; i >= 0; i--) if (trip_stops[i].trip_id === id) trip_stops.splice(i, 1)
    for (let i = trip_passengers.length - 1; i >= 0; i--) if (trip_passengers[i].trip_id === id) trip_passengers.splice(i, 1)
    return true
  },
  async listMessages() {
    await delay()
    return messages
  },
  async listBusLocations() {
    await delay(150)
    const latest = new Map()
    navigation_logs.forEach((n) => {
      latest.set(n.bus_id, n)
    })
    return buses.map((b) => ({
      bus_id: b.bus_id,
      plate_number: b.plate_number,
      status: b.status,
      capacity: b.capacity,
      ...latest.get(b.bus_id),
    }))
  },
}

// Realtime mock: simple listeners list and interval updates
const listeners = new Set()
setInterval(() => {
  // move bus 1 slightly west every 3 seconds; bus 2 slightly south
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

export const Realtime = {
  subscribe(cb) {
    listeners.add(cb)
    // send immediately
    cb(navigation_logs)
    return () => listeners.delete(cb)
  },
}
