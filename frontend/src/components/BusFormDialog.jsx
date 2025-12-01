import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const statuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE']

export default function BusFormDialog({ open, onClose, initialValue, onSubmit }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ plate_number: '', model: '', capacity: 0, status: 'ACTIVE' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialValue) setForm({ ...initialValue })
    else setForm({ plate_number: '', model: '', capacity: 0, status: 'ACTIVE' })
  }, [initialValue, open])

  const validate = () => {
    const e = {}
    if (!form.plate_number?.trim()) e.plate_number = t('errors.required')
    if (form.capacity < 0) e.capacity = t('errors.required')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!validate()) return
    onSubmit?.({ ...form, capacity: Number(form.capacity) || 0 })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialValue ? t('editBus') : t('addBus')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={t('plateNumber')}
            value={form.plate_number}
            onChange={(e) => setForm((f) => ({ ...f, plate_number: e.target.value }))}
            error={!!errors.plate_number}
            helperText={errors.plate_number}
            required
          />
          <TextField
            label={t('model')}
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
          />
          <TextField
            label={t('capacity')}
            type="number"
            value={form.capacity}
            onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
            error={!!errors.capacity}
            helperText={errors.capacity}
          />
          <TextField select label={t('busStatus')} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            {statuses.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button variant="contained" onClick={submit}>{t('save')}</Button>
      </DialogActions>
    </Dialog>
  )
}
