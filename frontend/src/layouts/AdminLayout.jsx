import { Box, Toolbar } from '@mui/material'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'

export default function AdminLayout() {
  const [q, setQ] = useState('')
  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar onSearch={setQ} />
      <Sidebar />
      <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Toolbar />
        <Outlet context={{ q }} />
      </Box>
    </Box>
  )
}
