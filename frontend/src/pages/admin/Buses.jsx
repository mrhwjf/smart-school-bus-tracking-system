import { Paper, Typography, Stack, Button, IconButton, Toolbar } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useMemo, useState } from 'react'
import { AdminService } from '../../api/services'
import { useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BusFormDialog from '../../components/BusFormDialog'
import ConfirmDialog from '../../components/ConfirmDialog'
import { DataGrid } from '@mui/x-data-grid'
import { useNotify } from '../../hooks/useNotify'
import { StatusChip } from '../../utils/status'

export default function Buses() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, row: null })
  const { q } = useOutletContext()
  const { t } = useTranslation()
  const notify = useNotify()
  useEffect(() => {
    setLoading(true)
    AdminService.listBuses(q).then(setRows).finally(() => setLoading(false))
  }, [q])
  const refresh = () => { setLoading(true); return AdminService.listBuses(q).then(setRows).finally(() => setLoading(false)) }
  const onAdd = () => { setEditing(null); setOpen(true) }
  const onEdit = (row) => { setEditing(row); setOpen(true) }
  const onDelete = (row) => setConfirm({ open: true, row })
  const confirmDelete = async () => {
    try {
      if (confirm.row) await AdminService.deleteBus(confirm.row.bus_id)
      notify.success(t('notify.deleted'))
    } catch {
      notify.error(t('notify.error'))
    }
    setConfirm({ open: false, row: null })
    refresh()
  }
  const onSubmit = async (form) => {
    try {
      if (editing) { await AdminService.updateBus(editing.bus_id, form); notify.success(t('notify.updated')) }
      else { await AdminService.createBus(form); notify.success(t('notify.created')) }
    } catch {
      notify.error(t('notify.error'))
    }
    setOpen(false); setEditing(null); refresh()
  }
  const columns = useMemo(() => [
    { field: 'bus_id', headerName: 'ID', width: 90 },
    { field: 'plate_number', headerName: t('plateNumber'), width: 160 },
    { field: 'model', headerName: t('model'), flex: 1, minWidth: 160 },
    { field: 'capacity', headerName: t('capacity'), width: 120 },
    {
      field: 'status', headerName: t('status'), width: 150,
      renderCell: (params) => <StatusChip code={params.value} />
    },
    {
      field: 'actions', headerName: t('actions'), width: 120, sortable: false, filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => onEdit(params.row)}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={() => onDelete(params.row)}><DeleteIcon fontSize="small" /></IconButton>
        </Stack>
      )
    },
  ], [t])
  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{t('buses')}</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={onAdd}>{t('addBus')}</Button>
      </Stack>
      <Paper sx={{ height: 520, width: '100%' }}>
        <Toolbar variant="dense" />
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.bus_id}
          pagination
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          loading={loading}
        />
      </Paper>
      <BusFormDialog open={open} onClose={() => setOpen(false)} initialValue={editing} onSubmit={onSubmit} />
      <ConfirmDialog
        open={confirm.open}
        title="Xóa xe buýt"
        message={`Bạn có chắc muốn xóa xe buýt "${confirm.row?.plate_number}"?`}
        cancelText={t('cancel')}
        okText={t('delete')}
        onCancel={() => setConfirm({ open: false, row: null })}
        onOk={confirmDelete}
      />
    </>
  )
}
