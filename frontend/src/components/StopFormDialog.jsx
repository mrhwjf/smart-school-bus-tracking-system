import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function StopFormDialog({ open, onClose, initialValue, onSubmit }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', address: '', latitude: '', longitude: '', seq_index: 0 })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialValue) setForm({ ...initialValue })
    else setForm({ name: '', address: '', latitude: '', longitude: '', seq_index: 0 })
  }, [initialValue, open])

  const validate = () => {
    const e = {}
    if (!form.name?.trim()) e.name = t('errors.required')
    const lat = Number(form.latitude), lng = Number(form.longitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90) e.latitude = '[-90, 90]'
    if (Number.isNaN(lng) || lng < -180 || lng > 180) e.longitude = '[-180, 180]'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!validate()) return
    onSubmit?.({ ...form, latitude: Number(form.latitude), longitude: Number(form.longitude), seq_index: Number(form.seq_index) || 0 })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialValue ? t('editStop') : t('addStop')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label={t('name')} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={!!errors.name} helperText={errors.name} required />
          <TextField label={t('address')} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          <TextField label={t('latitude')} value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} error={!!errors.latitude} helperText={errors.latitude} />
          <TextField label={t('longitude')} value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} error={!!errors.longitude} helperText={errors.longitude} />
          <TextField label={t('order')} type="number" value={form.seq_index} onChange={(e) => setForm((f) => ({ ...f, seq_index: e.target.value }))} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button variant="contained" onClick={submit}>{t('save')}</Button>
      </DialogActions>
    </Dialog>
  )
}
