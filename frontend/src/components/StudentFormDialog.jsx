import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminService } from '../api/services'

const genders = [
  { value: 'MALE', key: 'male' },
  { value: 'FEMALE', key: 'female' },
  { value: 'OTHER', key: 'other' },
]

export default function StudentFormDialog({ open, onClose, initialValue, onSubmit }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', classId: '', class: '', parentId: '', gender: 'OTHER', date_of_birth: '' })
  const [errors, setErrors] = useState({})
  const [parents, setParents] = useState([])
  const [classes, setClasses] = useState([])

  useEffect(() => {
    if (initialValue) {
      setForm({
        name: initialValue.name || '',
        classId: initialValue.class_id ?? initialValue.classId ?? '',
        class: initialValue.class ?? '',
        parentId: initialValue.parent_id ?? initialValue.parentId ?? '',
        gender: initialValue.gender || 'OTHER',
        date_of_birth: initialValue.date_of_birth ?? initialValue.dateOfBirth ?? '',
      })
    } else {
      setForm({ name: '', classId: '', class: '', parentId: '', gender: 'OTHER', date_of_birth: '' })
    }
  }, [initialValue, open])

  useEffect(() => {
    if (!open) return
    AdminService.listParentsDropdown().then(setParents).catch(() => setParents([]))
    AdminService.listClassesDropdown().then(setClasses).catch(() => setClasses([]))
  }, [open])

  const validate = () => {
    const e = {}
    if (!form.name?.trim()) e.name = t('errors.required')
    if (form.date_of_birth) {
      const d = new Date(form.date_of_birth)
      if (Number.isNaN(d.getTime())) e.date_of_birth = t('errors.invalidDate')
    }
    if (!form.classId) e.classId = t('errors.required')
    if (!form.parentId) e.parentId = t('errors.required')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!validate()) return
    const payload = {
      name: form.name,
      classId: form.classId,
      parentId: form.parentId,
      gender: form.gender,
      dateOfBirth: form.date_of_birth,
    }
    onSubmit?.(payload)
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
            select
            label={t('class')}
            value={form.classId}
            onChange={(e) => {
              const id = e.target.value
              const cls = classes.find((c) => String(c.class_id) === String(id))
              setForm((f) => ({ ...f, classId: id, class: cls?.name || f.class }))
            }}
            error={!!errors.classId}
            helperText={errors.classId}
            required
          >
            {classes.map((c) => (
              <MenuItem key={c.class_id} value={c.class_id}>{c.name ?? `Lớp ${c.class_id}`}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label={t('parent')}
            value={form.parentId}
            onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
            error={!!errors.parentId}
            helperText={errors.parentId}
            required
          >
            {parents.map((p) => (
              <MenuItem key={p.user_id} value={p.user_id}>{p.name}</MenuItem>
            ))}
          </TextField>
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
