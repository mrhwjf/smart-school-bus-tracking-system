import { Grid, Paper, Typography, Box, List, ListItemText } from '@mui/material'
import { useEffect, useState } from 'react'
import { AdminService, Realtime } from '../../api/services'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import { renderToStaticMarkup } from 'react-dom/server'

function StatCard({ title, value, color }) {
  return (
    <Paper
      sx={{
        flex: 1,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 140,
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="h3" sx={{ color, fontWeight: 800 }}>
        {value}
      </Typography>
    </Paper>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [buses, setBuses] = useState([])
  const { t } = useTranslation()

  useEffect(() => {
    AdminService.getOverview().then(setStats)
    AdminService.getAlerts().then(setAlerts)
    AdminService.listBusLocations().then(setBuses)

    const unsub = Realtime.subscribe((payload) => {
      setBuses((prev) =>
        prev.map((b) => {
          const latest = payload.find((p) => p.bus_id === b.bus_id)
          return latest ? { ...b, ...latest } : b
        }),
      )
    })
    return unsub
  }, [])

  if (!stats) return null

  const BusIcon = L.divIcon({
    html: renderToStaticMarkup(<DirectionsBusIcon sx={{ color: '#1976d2' }} />),
    className: '',
    iconSize: [24, 24],
  })

  const center = [10.78, 106.695]

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        {t('dashboard')}
      </Typography>

      {/* Hàng 1: 4 thống kê full width */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <StatCard title={t('overviewCards.students')} value={stats.students} color="#1976d2" />
        <StatCard title={t('overviewCards.drivers')} value={stats.drivers} color="#2e7d32" />
        <StatCard title={t('overviewCards.buses')} value={stats.buses} color="#6a1b9a" />
        <StatCard title={t('overviewCards.routes')} value={stats.routes} color="#ef6c00" />
      </Box>

      {/* Hàng 2: Bản đồ full width */}
      <Box sx={{ mb: 3 }}>
        <Paper sx={{ height: 500, position: 'relative' }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, p: 2, position: 'absolute', zIndex: 1000, background: 'white', borderRadius: 1 }}
          >
            Bản đồ xe buýt
          </Typography>
          <Box sx={{ height: '100%', width: '100%' }}>
            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {buses
                .filter((b) => b.latitude && b.longitude)
                .map((b) => (
                  <Marker key={b.bus_id} position={[b.latitude, b.longitude]} icon={BusIcon}>
                    <Popup>
                      <div>
                        <strong>{b.plate_number}</strong>
                        <div>Trạng thái: {b.status}</div>
                        <div>Thời gian: {new Date(b.recorded_at).toLocaleTimeString()}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </Box>
        </Paper>
      </Box>

      {/* Hàng 3: Các box thông tin */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 240 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Sự cố
            </Typography>
            <List dense>
              {alerts
                .filter((a) => a.severity === 'error')
                .slice(0, 5)
                .map((a) => (
                  <ListItemText
                    key={a.id}
                    primary={a.text}
                    secondary={new Date(a.sent_at).toLocaleString()}
                  />
                ))}
              {alerts.filter((a) => a.severity === 'error').length === 0 && (
                <Typography color="text.secondary">Không có sự cố.</Typography>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 240 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Tin nhắn mới
            </Typography>
            <List dense>
              {alerts.slice(0, 5).map((a) => (
                <ListItemText
                  key={a.id}
                  primary={a.text}
                  secondary={new Date(a.sent_at).toLocaleString()}
                />
              ))}
              {alerts.length === 0 && (
                <Typography color="text.secondary">Không có tin nhắn mới.</Typography>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 240 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Cảnh báo trễ
            </Typography>
            <List dense>
              {alerts
                .filter((a) => a.severity === 'warning')
                .slice(0, 5)
                .map((a) => (
                  <ListItemText
                    key={a.id}
                    primary={a.text}
                    secondary={new Date(a.sent_at).toLocaleString()}
                  />
                ))}
              {alerts.filter((a) => a.severity === 'warning').length === 0 && (
                <Typography color="text.secondary">Không có cảnh báo trễ.</Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
