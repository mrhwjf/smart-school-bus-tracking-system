import { Accordion, AccordionDetails, AccordionSummary, Chip, Stack, Typography, Button, IconButton, Tooltip } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useState } from 'react'
import { AdminService } from '../../api/services'
import { useTranslation } from 'react-i18next'
import RouteFormDialog from '../../components/RouteFormDialog'
import StopFormDialog from '../../components/StopFormDialog'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useNotify } from '../../hooks/useNotify'

export default function RoutesPage() {
  const [rows, setRows] = useState([])
  const [routeOpen, setRouteOpen] = useState(false)
  const [stopOpen, setStopOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState(null)
  const [editingStop, setEditingStop] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, type: '', payload: null })
  const { t } = useTranslation()
  const notify = useNotify()
  useEffect(() => {
    AdminService.listRoutes().then(setRows)
  }, [])
  const refresh = () => AdminService.listRoutes().then(setRows)
  const onAddRoute = () => { setEditingRoute(null); setRouteOpen(true) }
  const onEditRoute = (r) => { setEditingRoute(r); setRouteOpen(true) }
  const onDeleteRoute = (r) => setConfirm({ open: true, type: 'route', payload: r })
  const onSubmitRoute = async (form) => {
    try {
      if (editingRoute) { await AdminService.updateRoute(editingRoute.route_id, form); notify.success(t('notify.updated')) }
      else { await AdminService.createRoute(form); notify.success(t('notify.created')) }
    } catch {
      notify.error(t('notify.error'))
    }
    setRouteOpen(false); setEditingRoute(null); refresh()
  }

  const onAddStop = (route) => { setEditingStop({ route_id: route.route_id, name: '', address: '', latitude: '', longitude: '', seq_index: (route.stops?.length || 0) + 1 }) ; setStopOpen(true) }
  const onEditStop = (stop) => { setEditingStop(stop); setStopOpen(true) }
  const onDeleteStop = (stop) => setConfirm({ open: true, type: 'stop', payload: stop })
  const onSubmitStop = async (form) => {
    try {
      if (editingStop?.stop_id) { await AdminService.updateStop(editingStop.stop_id, form); notify.success(t('notify.updated')) }
      else { await AdminService.createStop(form); notify.success(t('notify.created')) }
    } catch {
      notify.error(t('notify.error'))
    }
    setStopOpen(false); setEditingStop(null); refresh()
  }
  const confirmDelete = async () => {
    try {
      if (confirm.type === 'route') await AdminService.deleteRoute(confirm.payload.route_id)
      if (confirm.type === 'stop') await AdminService.deleteStop(confirm.payload.stop_id)
      notify.success(t('notify.deleted'))
    } catch {
      notify.error(t('notify.error'))
    }
    setConfirm({ open: false, type: '', payload: null })
    refresh()
  }
  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{t('routes')}</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={onAddRoute}>{t('addRoute')}</Button>
      </Stack>
      {rows.map((r) => (
        <Accordion key={r.route_id} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}> 
            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
              <Typography sx={{ fontWeight: 600, flexGrow: 1 }}>{r.name}</Typography>
              <Tooltip title={t('editRoute')}><IconButton size="small" onClick={(e) => { e.stopPropagation(); onEditRoute(r) }}><EditIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title={t('delete')}><IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDeleteRoute(r) }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary" sx={{ mb: 1 }}>{r.description}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
              {r.stops.map((s, idx) => (
                <Chip
                  key={s.stop_id}
                  label={`${idx + 1}. ${s.name}`}
                  onClick={() => onEditStop(s)}
                  onDelete={() => onDeleteStop(s)}
                />
              ))}
            </Stack>
            <Button size="small" startIcon={<AddIcon />} onClick={() => onAddStop(r)}>{t('addStop')}</Button>
          </AccordionDetails>
        </Accordion>
      ))}
      <RouteFormDialog open={routeOpen} onClose={() => setRouteOpen(false)} initialValue={editingRoute} onSubmit={onSubmitRoute} />
      <StopFormDialog open={stopOpen} onClose={() => setStopOpen(false)} initialValue={editingStop} onSubmit={onSubmitStop} />
      <ConfirmDialog
        open={confirm.open}
        title={confirm.type === 'route' ? 'Xóa tuyến đường' : 'Xóa điểm dừng'}
        message={confirm.type === 'route' ? `Bạn có chắc muốn xóa tuyến "${confirm.payload?.name}"?` : `Bạn có chắc muốn xóa điểm dừng "${confirm.payload?.name}"?`}
        cancelText={t('cancel')}
        okText={t('delete')}
        onCancel={() => setConfirm({ open: false, type: '', payload: null })}
        onOk={confirmDelete}
      />
    </>
  )
}
