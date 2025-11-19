import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const genders = [
  { value: 'MALE', key: 'male' },
  { value: 'FEMALE', key: 'female' },
  { value: 'OTHER', key: 'other' },
]

export default function StudentFormDialog({ open, onClose, initialValue, onSubmit }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', class: '', gender: 'OTHER', date_of_birth: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialValue) setForm({ ...initialValue })
    else setForm({ name: '', class: '', gender: 'OTHER', date_of_birth: '' })
  }, [initialValue, open])

  const validate = () => {
    const e = {}
    if (!form.name?.trim()) e.name = t('errors.required')
    if (form.date_of_birth) {
      const d = new Date(form.date_of_birth)
      if (Number.isNaN(d.getTime())) e.date_of_birth = t('errors.invalidDate')
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
      <DialogTitle>{initialValue ? t('editStudent') : t('addStudent')}</DialogTitle>
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
            label={t('class')}
            value={form.class}
            onChange={(e) => setForm((f) => ({ ...f, class: e.target.value }))}
          />
          <TextField
            select
            label={t('gender')}
            value={form.gender}
            onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
          >
            {genders.map((g) => (
              <MenuItem key={g.value} value={g.value}>{t(g.key)}</MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('dateOfBirth')}
            type="date"
            value={form.date_of_birth || ''}
            onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            error={!!errors.date_of_birth}
            helperText={errors.date_of_birth}
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
