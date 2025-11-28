import { Box, Toolbar } from '@mui/material'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from '../pages/auth/Login'

export default function AdminLayout() {
  const [q, setQ] = useState('')
  // Keep token in state so layout reacts after login without full reload
  const [token, setToken] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null))
  const navigate = useNavigate()

  useEffect(() => {
    const handle = () => setToken(typeof window !== 'undefined' ? localStorage.getItem('authToken') : null)
    window.addEventListener('storage', handle)
    window.addEventListener('auth:changed', handle)
    return () => {
      window.removeEventListener('storage', handle)
      window.removeEventListener('auth:changed', handle)
    }
  }, [])

  // simple auth check: if no token, render Login screen
  if (!token) {
    return <Login />
  }
  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar onSearch={setQ} onLogout={() => {
        try {
          localStorage.removeItem('authToken')
          localStorage.removeItem('authUser')
          window.dispatchEvent(new Event('auth:changed'))
        } catch {}
        navigate('/login')
      }} />
      <Sidebar />
      <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Toolbar />
        <Outlet context={{ q }} />
      </Box>
    </Box>
  )
}
