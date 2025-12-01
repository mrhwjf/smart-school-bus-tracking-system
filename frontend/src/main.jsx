import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'antd/dist/reset.css'
import './i18n'
import ColorModeProvider from './context/ColorModeContext'
import { RouterProvider } from 'react-router-dom'
import router from './routes/AppRoutes'
import NotificationProvider from './context/NotificationProvider.jsx'

// Force showing the login screen on each reload unless explicitly allowed
try {
  const persist = String(import.meta.env.VITE_PERSIST_LOGIN || '').toLowerCase() === 'true'
  if (!persist) {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
  }
} catch (error) {
  // Log the error so the catch block is not empty
  console.warn('Failed to check persist login:', error)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </ColorModeProvider>
  </StrictMode>,
)
