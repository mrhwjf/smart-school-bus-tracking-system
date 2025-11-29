import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, GeoJSON } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import { AdminService, Realtime } from '../../api/services'
import { getDirections } from '../../api/ors'
import { Paper, Typography, Box, Chip } from '@mui/material'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import { renderToStaticMarkup } from 'react-dom/server'
import { useTranslation } from 'react-i18next'
import { StatusChip } from '../../utils/status'
import VehicleList from '../../components/VehicleList'

const BusIcon = L.divIcon({
  html: renderToStaticMarkup(<DirectionsBusIcon sx={{ color: '#1976d2' }} />),
  className: '',
  iconSize: [24, 24],
})

const SelectedBusIcon = L.divIcon({
  html: renderToStaticMarkup(<DirectionsBusIcon sx={{ color: '#d32f2f', fontSize: 28 }} />),
  className: '',
  iconSize: [30, 30],
})

const createClusterIcon = (cluster) => {
  const count = cluster.getChildCount()
  const size = count < 10 ? 28 : count < 50 ? 34 : 40
  const bg = count < 10 ? '#1976d2' : count < 50 ? '#2e7d32' : '#f57c00'
  return L.divIcon({
    html: `<div style="background:${bg};color:#fff;border-radius:999px;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;box-shadow:0 0 0 2px rgba(255,255,255,0.6)">${count}</div>`,
    className: '',
    iconSize: [size, size],
  })
}

function haversine(a, b) {
  if (!a || !b) return Infinity
  const toRad = (x) => (x * Math.PI) / 180
  const R = 6371000
  const dLat = toRad((b.lat ?? b.latitude) - (a.lat ?? a.latitude))
  const dLon = toRad((b.lng ?? b.longitude) - (a.lng ?? a.longitude))
  const lat1 = toRad(a.lat ?? a.latitude)
  const lat2 = toRad(b.lat ?? b.latitude)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

function minutesNow() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

function minutesFromIso(iso) {
  if (!iso) return null
  const m = /T(\d{2}):(\d{2})/.exec(iso)
  if (!m) return null
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
}

export default function Tracking() {
  const [buses, setBuses] = useState([])
  const [trips, setTrips] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | onTime | delayed | stale
  const { t } = useTranslation()
  const mapRef = useRef(null)
  useEffect(() => {
    let mounted = true
    // Load trips first to know which buses are valid from DB
    AdminService.listTrips().then((tripData) => {
      if (!mounted) return
      const tripsArr = Array.isArray(tripData) ? tripData : []
      setTrips(tripsArr)
      const validBusIds = new Set(tripsArr.map((t) => t.bus?.bus_id).filter(Boolean))
      // Load bus locations and keep only buses present in trips
      AdminService.listBusLocations().then((locs) => {
        if (!mounted) return
        const arr = Array.isArray(locs) ? locs : []
        const filtered = arr.filter((b) => validBusIds.has(b.bus_id))
        setBuses(filtered)
      })
    })

    // Batch realtime updates every ~200ms to reduce re-renders
    const queueRef = { map: new Map() }
    const flush = () => {
      if (queueRef.map.size === 0) return
      setBuses((prev) => {
        const next = [...prev]
        const indexById = new Map(next.map((b, i) => [b.bus_id, i]))
        queueRef.map.forEach((upd, id) => {
          const idx = indexById.get(id)
          if (idx != null) next[idx] = { ...next[idx], ...upd }
          else next.push(upd)
        })
        return next
      })
      queueRef.map.clear()
    }
    const interval = setInterval(flush, 200)

    // Subscribe to realtime only when payload includes recorded_at (backend source). Ignore mock payloads.
    const unsub = Realtime.subscribe((payload) => {
      const ids = new Set((trips || []).map((t) => t.bus?.bus_id).filter(Boolean))
      payload.forEach((p) => {
        if (ids.has(p.bus_id) && p.recorded_at) queueRef.map.set(p.bus_id, p)
      })
    })

    return () => {
      mounted = false
      clearInterval(interval)
      unsub?.()
    }
  }, [])
  const center = [10.78, 106.695]
  const selectedBus = buses.find((b) => b.bus_id === selectedId) || buses[0]
  const selectedTrip = trips.find((t) => t.bus?.bus_id === selectedBus?.bus_id)
  const polyline = (selectedTrip?.stops || [])
    .filter((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number')
    .map((s) => [s.latitude, s.longitude])

  const [routeGeojson, setRouteGeojson] = useState(null)

  // Fetch ORS directions for the selected trip stops (if available)
  useEffect(() => {
    let mounted = true
    setRouteGeojson(null)
    const stops = (selectedTrip?.stops || []).filter((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number')
    if (!stops || stops.length < 2) return

    ;(async () => {
      try {
        // ORS expects [lng, lat]
        const coords = stops.map((s) => [s.longitude, s.latitude])
        const geo = await getDirections(coords, 'driving-car', { instructions: false })
        if (mounted && geo) setRouteGeojson(geo)
      } catch (err) {
        console.error('ORS directions error:', err)
      }
    })()

    return () => {
      mounted = false
    }
  }, [selectedTrip])

  // Prepare faint polylines for other trips to give context
  const otherTripPolylines = trips
    .filter((t) => t.trip_id !== selectedTrip?.trip_id)
    .map((t) => {
      const pts = (t.stops || []).filter((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number').map((s) => [s.latitude, s.longitude])
      return { trip: t, positions: pts }
    })

  useEffect(() => {
    if (mapRef.current && selectedBus?.latitude && selectedBus?.longitude) {
      mapRef.current.setView([selectedBus.latitude, selectedBus.longitude], 14, { animate: true })
    }
  }, [selectedId, selectedBus])

  const nextStop = (() => {
    if (!selectedTrip || !selectedBus) return null
    const coords = { lat: selectedBus.latitude, lng: selectedBus.longitude }
    let minIdx = -1
    let minD = Infinity
    ;(selectedTrip.stops || []).forEach((s, idx) => {
      const d = haversine(coords, { lat: s.latitude, lng: s.longitude })
      if (d < minD) { minD = d; minIdx = idx }
    })
    const nextIdx = Math.min((minIdx ?? 0) + 1, (selectedTrip.stops?.length || 1) - 1)
    return selectedTrip.stops?.[nextIdx] || null
  })()

  const computePunctuality = (trip, bus) => {
    const startM = minutesFromIso(trip?.start_time)
    if (startM == null || !bus?.latitude) return { label: '—', color: 'default' }
    const nowM = minutesNow()
    const firstStop = trip?.stops?.[0]
    const farFromStart = firstStop ? haversine({ lat: bus.latitude, lng: bus.longitude }, { lat: firstStop.latitude, lng: firstStop.longitude }) > 800 : false
    const lateBy = nowM - startM
    if (lateBy > 5 && farFromStart) return { label: `Trễ ${lateBy}p`, color: 'warning' }
    return { label: 'Đúng giờ', color: 'success' }
  }

  const fleetRaw = trips.map((t) => {
    const b = buses.find((x) => x.bus_id === t.bus?.bus_id)
    const pun = computePunctuality(t, b)
    // derive status meta based on staleness
    let statusMeta = null
    if (b?.recorded_at) {
      const age = Date.now() - new Date(b.recorded_at).getTime()
      if (age > 30000) statusMeta = { label: 'Mất tín hiệu', color: 'default', key: 'stale' }
    }
    if (!statusMeta) {
      statusMeta = pun.color === 'warning' ? { label: 'Trễ', color: 'warning', key: 'delayed' } : { label: 'Đúng giờ', color: 'success', key: 'onTime' }
    }
    return { trip: t, bus: b, punctuality: pun, statusMeta }
  }).filter((x) => x.bus)

  const fleetFiltered = fleetRaw.filter(({ trip, bus, statusMeta }) => {
    const q = (query || '').toLowerCase()
    const okQuery = !q ||
      (bus?.plate_number || '').toLowerCase().includes(q) ||
      (trip?.driver?.name || '').toLowerCase().includes(q) ||
      (trip?.route?.name || '').toLowerCase().includes(q)
    const okStatus = statusFilter === 'all' || statusMeta?.key === statusFilter
    return okQuery && okStatus
  })
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>{t('tracking')}</Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Left: fleet list with search/filter */}
        <VehicleList
          items={fleetFiltered}
          selectedId={selectedId}
          onSelect={setSelectedId}
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
        />
        {/* Right: map */}
        <Paper sx={{ flex: 1, height: 520, overflow: 'hidden' }}>
          <Box sx={{ p: 1.5, pb: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>Bản đồ</Typography>
            {selectedTrip && <StatusChip code={selectedTrip.status} />}
            {nextStop && <Chip size="small" label={`Điểm tiếp theo: ${nextStop.name}`} />}
          </Box>
          <Box sx={{ position: 'relative' }}>
            <MapContainer center={center} zoom={12} style={{ height: 480 }} whenCreated={(map) => (mapRef.current = map)}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
            {/* render other trips faintly for context */}
            {otherTripPolylines.map((r) =>
              r.positions.length > 1 ? (
                <Polyline key={r.trip.trip_id} positions={r.positions} pathOptions={{ color: '#999', weight: 2, opacity: 0.35 }} />
              ) : null,
            )}

            {(polyline.length > 1 || routeGeojson) && (
              <>
                {routeGeojson ? (
                  <GeoJSON data={routeGeojson} style={{ color: '#ff6600', weight: 6, opacity: 0.95 }} />
                ) : (
                  <Polyline positions={polyline} pathOptions={{ color: '#2e7d32', weight: 6, opacity: 0.95 }} />
                )}
                {(selectedTrip?.stops || []).map((s, i) => (
                  <CircleMarker key={s.stop_id} center={[s.latitude, s.longitude]} radius={6} pathOptions={{ color: i === 0 ? '#0277bd' : '#2e7d32', fillOpacity: 0.95 }} />
                ))}
                {/* start / end markers */}
                {polyline.length > 0 && (
                  <>
                    <CircleMarker center={polyline[0]} radius={8} pathOptions={{ color: '#0277bd', fillColor: '#0277bd', fillOpacity: 1 }} />
                    <CircleMarker center={polyline[polyline.length - 1]} radius={8} pathOptions={{ color: '#d32f2f', fillColor: '#d32f2f', fillOpacity: 1 }} />
                  </>
                )}
              </>
            )}
            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={createClusterIcon}
              showCoverageOnHover={false}
              maxClusterRadius={(zoom) => (zoom < 13 ? 60 : zoom < 15 ? 50 : 40)}
              spiderfyOnMaxZoom
              spiderfyDistanceMultiplier={1.2}
              animate
              animateAddingMarkers
              removeOutsideVisibleBounds
              zoomToBoundsOnClick
            >
              {buses
                .filter((b) => b.latitude && b.longitude)
                .map((b) => (
                  <Marker key={b.bus_id} position={[b.latitude, b.longitude]} icon={b.bus_id === selectedBus?.bus_id ? SelectedBusIcon : BusIcon} eventHandlers={{ click: () => setSelectedId(b.bus_id) }}>
                    <Popup>
                      <div>
                        <strong>{b.plate_number}</strong>
                        <div>Trạng thái: {b.status}</div>
                        <div>Thời gian: {new Date(b.recorded_at).toLocaleTimeString()}</div>
                        {trips.find((t) => t.bus?.bus_id === b.bus_id)?.driver?.name && (
                          <div>Tài xế: {trips.find((t) => t.bus?.bus_id === b.bus_id)?.driver?.name}</div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MarkerClusterGroup>
            </MapContainer>
            <Box sx={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.95)', borderRadius: 1, p: 1, boxShadow: 1, zIndex: 500 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Ghi chú</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                <Box sx={{ width: 18, height: 6, background: '#ff6600' }} />
                <Typography variant="caption">Tuyến chọn</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                <Box sx={{ width: 18, height: 6, background: '#999' }} />
                <Typography variant="caption">Tuyến khác (mờ)</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  )
}
