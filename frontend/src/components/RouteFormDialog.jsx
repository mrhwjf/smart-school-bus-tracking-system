import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function RouteFormDialog({ open, onClose, initialValue, onSubmit }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', description: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialValue) setForm({ ...initialValue })
    else setForm({ name: '', description: '' })
  }, [initialValue, open])

  const validate = () => {
    const e = {}
    if (!form.name?.trim()) e.name = t('errors.required')
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const submit = () => {
    if (!validate()) return
    onSubmit?.(form)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialValue ? t('editRoute') : t('addRoute')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={t('routeName')}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
          <TextField
            label={t('description')}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            multiline
            minRows={2}
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
