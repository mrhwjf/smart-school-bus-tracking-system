import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, MenuItem } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { routes, buses, students, stops } from '../api/mockData'

const statuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED']

export default function TripFormDialog({ open, onClose, initialValue, onSubmit }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ route_id: '', bus_id: '', start_time: '', end_time: '', status: 'SCHEDULED', stop_ids: [], student_ids: [] })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialValue) setForm({ ...initialValue })
    else setForm({ route_id: '', bus_id: '', start_time: '', end_time: '', status: 'SCHEDULED', stop_ids: [], student_ids: [] })
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
    onSubmit?.({ ...form, route_id: Number(form.route_id), bus_id: Number(form.bus_id) })
  }

  const allStops = form.route_id ? stops.filter((s) => s.route_id === Number(form.route_id)) : []

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialValue ? t('editTrip') : t('addTrip')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField select label={t('route')} value={form.route_id} onChange={(e) => setForm((f) => ({ ...f, route_id: e.target.value, stop_ids: [] }))} error={!!errors.route_id} helperText={errors.route_id} required>
            {routes.map((r) => (
              <MenuItem key={r.route_id} value={r.route_id}>{r.name}</MenuItem>
            ))}
          </TextField>
          <TextField select label={t('plateNumber')} value={form.bus_id} onChange={(e) => setForm((f) => ({ ...f, bus_id: e.target.value }))} error={!!errors.bus_id} helperText={errors.bus_id} required>
            {buses.map((b) => (
              <MenuItem key={b.bus_id} value={b.bus_id}>{b.plate_number}</MenuItem>
            ))}
          </TextField>
          <TextField label={t('startTime')} type="datetime-local" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} InputLabelProps={{ shrink: true }} />
          <TextField label={t('endTime')} type="datetime-local" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} InputLabelProps={{ shrink: true }} />
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
            helperText={`Available: ${students.map((s) => s.student_id).join(', ')}`}
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
