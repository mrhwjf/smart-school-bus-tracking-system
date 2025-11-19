import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import ColorModeProvider from './context/ColorModeContext'
import { RouterProvider } from 'react-router-dom'
import router from './routes/AppRoutes'
import NotificationProvider from './context/NotificationProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </ColorModeProvider>
  </StrictMode>,
)
