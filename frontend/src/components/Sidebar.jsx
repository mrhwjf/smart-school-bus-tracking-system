import { List, ListItemButton, ListItemIcon, ListItemText, Box, Toolbar, Tooltip, Divider, IconButton, Typography } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SchoolIcon from '@mui/icons-material/School'
import RouteIcon from '@mui/icons-material/AltRoute'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import PeopleIcon from '@mui/icons-material/People'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import MessageIcon from '@mui/icons-material/Message'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { NavLink, useLocation } from 'react-router-dom'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MenuIcon from '@mui/icons-material/Apps'
import { useEffect, useRef, useState } from 'react'

const items = [
  { to: '/', icon: <DashboardIcon />, label: 'Tổng quan' },
  { to: '/students', icon: <SchoolIcon />, label: 'Học sinh' },
  { to: '/drivers', icon: <PeopleIcon />, label: 'Tài xế' },
  { to: '/buses', icon: <DirectionsBusIcon />, label: 'Xe buýt' },
  { to: '/routes', icon: <RouteIcon />, label: 'Tuyến đường' },
  { to: '/schedules', icon: <CalendarMonthIcon />, label: 'Lịch trình' },
  { to: '/assignments', icon: <CompareArrowsIcon />, label: 'Phân công' },
  { to: '/messages', icon: <MessageIcon />, label: 'Tin nhắn' },
  { to: '/tracking', icon: <MyLocationIcon />, label: 'Theo dõi' },
]

export default function Sidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sb_collapsed') === '1')
  const [width, setWidth] = useState(() => {
    const w = Number(localStorage.getItem('sb_width') || 260)
    return Math.min(Math.max(w, 72), 320)
  })
  const effectiveWidth = collapsed ? 72 : width
  const resizerRef = useRef(null)

  const notifyLayout = (w, c) => {
    const effective = c ? 72 : Math.min(Math.max(w, 72), 360)
    window.dispatchEvent(new CustomEvent('sidebar-change', { detail: { width: w, collapsed: c, effectiveWidth: effective } }))
  }
  useEffect(() => {
    localStorage.setItem('sb_collapsed', collapsed ? '1' : '0')
    notifyLayout(width, collapsed)
  }, [collapsed, width])
  useEffect(() => {
    localStorage.setItem('sb_width', String(width))
    notifyLayout(width, collapsed)
  }, [width, collapsed])

  const startResize = (e) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = width
    const onMove = (ev) => {
      const dx = ev.clientX - startX
      const next = Math.min(Math.max(startW + dx, 180), 360)
      setWidth(next)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <Box sx={{ width: effectiveWidth, flexShrink: 0, borderRight: '1px solid #eee', height: '100dvh', position: 'sticky', top: 0, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
      {/* Spacer for fixed Topbar so first item aligns with brand */}
      <Toolbar sx={{ minHeight: 64 }} />
      <Divider />
  <List sx={{ px: 1, py: 1, flex: 1, overflowY: 'auto' }}>
        {items.map((item) => {
          const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
          const button = (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              selected={active}
              sx={{
                gap: 1,
                borderRadius: 1,
                my: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'warning.main',
                  color: 'common.white',
                  '& .MuiListItemIcon-root': { color: 'common.white' },
                },
                '&.Mui-selected:hover': { bgcolor: 'warning.dark' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} />}
            </ListItemButton>
          )
          return collapsed ? (
            <Tooltip key={item.to} title={item.label} placement="right">{button}</Tooltip>
          ) : (
            button
          )
        })}
      </List>
      {/* Collapse toggle */}
  <Box sx={{ position: 'relative', bottom: 8, left: 0, right: 0, px: 1, pb: 1 }}>
        <Divider sx={{ mb: 1 }} />
        <IconButton onClick={() => setCollapsed((v) => !v)} sx={{ mx: 'auto', display: 'block' }} size="small">
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      {/* Resize handle */}
      {!collapsed && (
        <Box
          ref={resizerRef}
          onMouseDown={startResize}
          sx={{ position: 'absolute', top: 0, right: -2, width: 4, height: '100%', cursor: 'col-resize', '&:hover': { bgcolor: 'action.hover' } }}
        />
      )}
    </Box>
  )
}
