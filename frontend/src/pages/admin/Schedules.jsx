import { Paper, Chip, Stack, Typography, Button, Box, Collapse, IconButton, Toolbar } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { AdminService } from '../../api/services'
import { useTranslation } from 'react-i18next'
import TripFormDialog from '../../components/TripFormDialog'
import ConfirmDialog from '../../components/ConfirmDialog'
import { DataGrid } from '@mui/x-data-grid'
import { useNotify } from '../../hooks/useNotify'
import { StatusChip } from '../../utils/status'

export default function Schedules() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, row: null })
  const [expandedIds, setExpandedIds] = useState(new Set())
  const { t } = useTranslation()
  const notify = useNotify()

  const fetchTrips = useCallback(async () => {
    setLoading(true)
    try {
      // Schedules page should show weekly schedules, not day trips
      const [schedules, routes, buses] = await Promise.all([
        AdminService.listSchedules(),
        AdminService.listRoutes().catch(() => []),
        AdminService.listBuses().catch(() => []),
      ])
      const routeMap = new Map((Array.isArray(routes) ? routes : []).map((r) => [r.route_id ?? r.routeId, r]))
      const busMap = new Map((Array.isArray(buses) ? buses : []).map((b) => [b.bus_id ?? b.busId ?? b.id, b]))
      const rows = (Array.isArray(schedules) ? schedules : []).map((s) => ({
        trip_id: s.schedule_id, // use schedule_id as ID for the grid
        route: routeMap.get(s.route_id) || null,
        bus: busMap.get(s.bus_id) || null,
        start_time: s.start_time,
        end_time: s.end_time,
        status: s.active ? 'SCHEDULED' : 'INACTIVE',
        stops: (routeMap.get(s.route_id)?.stops) || [],
        passengers: [],
      }))
      setRows(rows)
    } catch {
      notify.error(t('notify.error'))
    } finally {
      setLoading(false)
    }
  }, [notify, t])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  const onAdd = () => {
    setEditing(null)
    setOpen(true)
  }

  const onEdit = (row) => {
    setEditing({
      ...row,
      route_id: row.route?.route_id,
      bus_id: row.bus?.bus_id,
      stop_ids: row.stops?.map((s) => s.stop_id) || [],
      student_ids: row.passengers?.map((p) => p.student_id) || []
    })
    setOpen(true)
  }

  const onDelete = (row) => setConfirm({ open: true, row })

  const confirmDelete = async () => {
    try {
      if (confirm.row) {
        await AdminService.deleteTrip(confirm.row.trip_id)
        notify.success(t('notify.deleted'))
        fetchTrips()
      }
    } catch {
      notify.error(t('notify.error'))
    }
    setConfirm({ open: false, row: null })
  }

  const onSubmit = async (form) => {
    try {
      if (editing) {
        await AdminService.updateTrip(editing.trip_id, form)
        notify.success(t('notify.updated'))
      } else {
        await AdminService.createTrip(form)
        notify.success(t('notify.created'))
      }
      setOpen(false)
      setEditing(null)
      fetchTrips()
    } catch {
      notify.error(t('notify.error'))
    }
  }

  const formatDateTime = (value) => {
    if (!value) return '—'
    try {
      let date = new Date(value)
      // Nếu date không hợp lệ, thử parse với timezone
      if (isNaN(date.getTime()) && typeof value === 'string') {
        date = new Date(value.includes('Z') ? value : value + 'Z')
      }
      if (isNaN(date.getTime())) return '—'

      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '—'
    }
  }

  const toggleExpand = (tripId) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tripId)) {
        newSet.delete(tripId)
      } else {
        newSet.add(tripId)
      }
      return newSet
    })
  }

  const columns = useMemo(() => [
    {
      field: 'trip_id',
      headerName: 'ID',
      width: 70,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'route',
      headerName: t('route'),
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Typography
          variant="body2"
          className="schedule-route-cell"
          sx={{ fontWeight: 500 }}
        >
          {params.row?.route?.name || '—'}
        </Typography>
      ),
    },

    {
      field: 'bus',
      headerName: t('plateNumber'),
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.row?.bus?.plate_number || '—'}
        </Typography>
      )
    },
    {
      field: 'start_time',
      headerName: t('startTime'),
      flex: 1,
      minWidth: 160,
      valueFormatter: (params) => formatDateTime(params?.value)
    },
    {
      field: 'end_time',
      headerName: t('endTime'),
      flex: 1,
      minWidth: 160,
      valueFormatter: (params) => formatDateTime(params?.value)
    },
    {
      field: 'status',
      headerName: t('status'),
      width: 140,
      renderCell: (params) => <StatusChip code={params.value} />
    },
    {
      field: 'actions',
      headerName: t('actions'),
      width: 160,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={expandedIds.has(params.row.trip_id) ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
            onClick={(e) => { e.stopPropagation(); toggleExpand(params.row.trip_id) }}
            sx={{ minWidth: 36, height: 30, px: 0.5, fontSize: '0.72rem', lineHeight: 1 }}
          >
            Chi tiết
          </Button>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onEdit(params.row) }}
            sx={{ color: 'primary.main', p: 0.5, borderRadius: '50%' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => { e.stopPropagation(); onDelete(params.row) }}
            sx={{ p: 0.5, borderRadius: '50%' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ], [t, expandedIds])

  const DetailPanel = ({ row }) => {
    const isExpanded = expandedIds.has(row.trip_id)

    return (
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider' }}>
          <Stack spacing={2}>
            {/* Điểm dừng */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                📍 Điểm dừng ({row.stops?.length || 0})
              </Typography>
              {row.stops && row.stops.length > 0 ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {row.stops.map((stop, idx) => (
                    <Chip
                      key={stop.stop_id}
                      size="small"
                      label={`${idx + 1}. ${stop.name}`}
                      variant="outlined"
                      sx={{ bgcolor: 'background.paper' }}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có điểm dừng
                </Typography>
              )}
            </Box>

            {/* Hành khách */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                👥 Hành khách ({row.passengers?.length || 0})
              </Typography>
              {row.passengers && row.passengers.length > 0 ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {row.passengers.map((passenger) => (
                    <Chip
                      key={passenger.student_id}
                      size="small"
                      label={passenger.name}
                      color="primary"
                      variant="outlined"
                      sx={{ bgcolor: 'background.paper' }}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có hành khách
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>
      </Collapse>
    )
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('schedules')}
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={onAdd}
          size="large"
        >
          {t('addTrip')}
        </Button>
      </Stack>

      <Paper sx={{ width: '100%' }}>
        <Toolbar variant="dense" />
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.trip_id}
          loading={loading}
          rowHeight={56}
          pagination
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          disableRowSelectionOnClick
          sx={{
            width: '100%',
            border: 'none',
            '& .MuiDataGrid-main': { width: '100%' },
            '& .MuiDataGrid-cell': {
              py: 1,
              alignItems: 'center',
            },
            '& .schedule-route-cell': {
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              alignItems: 'flex-start',
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'action.hover',
              fontWeight: 600,
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: 'action.hover',
            },
          }}
        />

        {/* Render expanded detail panels */}
        {rows.filter((r) => expandedIds.has(r.trip_id)).map((r) => (
          <DetailPanel key={`detail-${r.trip_id}`} row={r} />
        ))}
      </Paper>


      <TripFormDialog
        open={open}
        onClose={() => setOpen(false)}
        initialValue={editing}
        onSubmit={onSubmit}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Xóa chuyến"
        message={`Bạn có chắc muốn xóa chuyến #${confirm.row?.trip_id}?`}
        cancelText={t('cancel')}
        okText={t('delete')}
        onCancel={() => setConfirm({ open: false, row: null })}
        onOk={confirmDelete}
      />
    </Box>
  )
}