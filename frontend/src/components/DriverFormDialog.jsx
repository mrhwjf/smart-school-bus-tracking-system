import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, FormControlLabel, Switch } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function DriverFormDialog({ open, onClose, initialValue, onSubmit }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', phone_number: '', email: '', license_number: '', is_active: true })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialValue) setForm({ ...initialValue })
    else setForm({ name: '', phone_number: '', email: '', license_number: '', is_active: true })
  }, [initialValue, open])

  const validate = () => {
    const e = {}
    if (!form.name?.trim()) e.name = t('errors.required')
    if (!form.license_number?.trim()) e.license_number = t('errors.licenseRequired')
    if (form.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.email)) e.email = t('errors.invalidEmail')
    }
    if (form.phone_number?.trim()) {
      const phoneRegex = /^\+?\d{9,15}$/
      if (!phoneRegex.test(form.phone_number)) e.phone_number = t('errors.invalidPhone')
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!validate()) return
    onSubmit?.(form)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialValue ? t('editDriver') : t('addDriver')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={t('fullName')}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
          <TextField
            label={t('phone')}
            value={form.phone_number}
            onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
          />
          <TextField
            label={t('email')}
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            label={t('licenseNumber')}
            value={form.license_number}
            onChange={(e) => setForm((f) => ({ ...f, license_number: e.target.value }))}
            error={!!errors.license_number}
            helperText={errors.license_number}
          />
          <FormControlLabel
            control={<Switch checked={!!form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />}
            label={t('active')}
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
