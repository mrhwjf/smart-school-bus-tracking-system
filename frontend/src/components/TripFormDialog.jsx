import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, MenuItem } from '@mui/material'
import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const statuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED']

export default function TripFormDialog({ open, onClose, initialValue, onSubmit, routes = [], buses = [] }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ route_id: '', bus_id: '', start_time: '', end_time: '', status: 'SCHEDULED', stop_ids: [], student_ids: [] })
  const [errors, setErrors] = useState({})

  // Chuẩn hóa mọi kiểu input thành HH:mm cho field time
  const toHHmm = (val) => {
    if (!val) return ''
    if (typeof val === 'string') {
      const m = val.match(/^\s*(\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,9})?)?.*$/)
      if (m) return `${m[1]}:${m[2]}`
    }
    const d = new Date(val)
    if (!isNaN(d.getTime())) {
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      return `${hh}:${mm}`
    }
    return ''
  }

  useEffect(() => {
    if (initialValue) {
      setForm({
        ...initialValue,
        start_time: toHHmm(initialValue.start_time ?? initialValue.startTime),
        end_time: toHHmm(initialValue.end_time ?? initialValue.endTime),
      })
    } else {
      setForm({ route_id: '', bus_id: '', start_time: '', end_time: '', status: 'SCHEDULED', stop_ids: [], student_ids: [] })
    }
  }, [initialValue, open])

  const validate = () => {
    const e = {}
    if (!form.route_id) e.route_id = t('errors.required')
    if (!form.bus_id) e.bus_id = t('errors.required')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!validate()) return
    // Đảm bảo chỉ gửi HH:mm cho backend
    const payload = {
      ...form,
      start_time: toHHmm(form.start_time),
      end_time: toHHmm(form.end_time),
      route_id: Number(form.route_id),
      bus_id: Number(form.bus_id),
    }
    onSubmit?.(payload)
  }

  const allStops = useMemo(() => {
    if (!form.route_id) return []
    const r = (routes || []).find((x) => (x.route_id ?? x.routeId) === Number(form.route_id))
    const list = r?.stops || []
    return Array.isArray(list) ? list : []
  }, [form.route_id, routes])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialValue ? t('editTrip') : t('addTrip')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField select label={t('route')} value={form.route_id} onChange={(e) => setForm((f) => ({ ...f, route_id: e.target.value, stop_ids: [] }))} error={!!errors.route_id} helperText={errors.route_id} required>
            {(routes || []).map((r) => {
              const id = r.route_id ?? r.routeId
              return <MenuItem key={id} value={id}>{r.name}</MenuItem>
            })}
          </TextField>
          <TextField select label={t('plateNumber')} value={form.bus_id} onChange={(e) => setForm((f) => ({ ...f, bus_id: e.target.value }))} error={!!errors.bus_id} helperText={errors.bus_id} required>
            {(buses || []).map((b) => {
              const id = b.bus_id ?? b.busId ?? b.id
              const plate = b.plate_number ?? b.plateNumber
              return <MenuItem key={id} value={id}>{plate}</MenuItem>
            })}
          </TextField>
          <TextField label={t('startTime')} type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: toHHmm(e.target.value) }))} InputLabelProps={{ shrink: true }} inputProps={{ step: 60 }} />
          <TextField label={t('endTime')} type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: toHHmm(e.target.value) }))} InputLabelProps={{ shrink: true }} inputProps={{ step: 60 }} />
          <TextField select label={t('tripStatus')} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            {statuses.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField
            label={`${t('stops')} (IDs, comma separated)`}
            value={form.stop_ids.join(',')}
            onChange={(e) => setForm((f) => ({ ...f, stop_ids: e.target.value.split(',').map((x) => Number(x.trim())).filter((x) => !Number.isNaN(x)) }))}
            helperText={allStops.length ? `Available: ${allStops.map((s) => s.stop_id).join(', ')}` : ''}
          />
          <TextField
            label={`Students (IDs, comma separated)`}
            value={form.student_ids.join(',')}
            onChange={(e) => setForm((f) => ({ ...f, student_ids: e.target.value.split(',').map((x) => Number(x.trim())).filter((x) => !Number.isNaN(x)) }))}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button variant="contained" onClick={submit}>{t('save')}</Button>
      </DialogActions>
    </Dialog>
  )
}
