import { Alert, Snackbar } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { NotificationContext } from './NotificationContext'

export default function NotificationProvider({ children }) {
  const [state, setState] = useState({ open: false, type: 'success', message: '' })
  const close = () => setState((s) => ({ ...s, open: false }))
  const success = useCallback((message) => setState({ open: true, type: 'success', message }), [])
  const error = useCallback((message) => setState({ open: true, type: 'error', message }), [])
  const value = useMemo(() => ({ success, error }), [success, error])
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar open={state.open} autoHideDuration={3000} onClose={close} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={close} severity={state.type} variant="filled" sx={{ width: '100%' }}>
          {state.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}
