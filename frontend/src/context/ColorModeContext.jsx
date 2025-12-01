import React, { useMemo, useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import ColorModeContext from './colorModeData'

function getDesignTokens(mode) {
  const dark = {
    mode: 'dark',
    primary: { main: '#64b5f6', contrastText: '#061223' },
    secondary: { main: '#4db6ac' },
    info: { main: '#90caf9' },
    success: { main: '#66bb6a' },
    warning: { main: '#ffb74d', dark: '#f57c00' },
    error: { main: '#ef5350' },
    background: { default: '#071326', paper: '#0d1f2b' },
    text: { primary: 'rgba(255,255,255,0.92)', secondary: 'rgba(255,255,255,0.7)' },
    divider: 'rgba(255,255,255,0.12)',
    action: {
      active: '#e6eef9',
      hover: 'rgba(255,255,255,0.04)',
      selected: 'rgba(255,255,255,0.06)',
      disabledBackground: 'rgba(255,255,255,0.04)',
    },
  }

  const light = {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#2e7d32' },
    warning: { main: '#f97316', dark: '#ea580c' },
    background: { default: '#f7f9fc', paper: '#ffffff' },
    text: { primary: '#0f1724', secondary: 'rgba(15,23,36,0.6)' },
    divider: 'rgba(15,23,36,0.08)',
  }

  const base = {
    shape: { borderRadius: 10 },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 12, transition: 'background-color 250ms ease, color 250ms ease, box-shadow 250ms ease' },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { transition: 'background-color 250ms ease, color 250ms ease, box-shadow 250ms ease' },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 250ms ease, color 250ms ease',
          },
        },
      },
    },
  }

  return {
    palette: mode === 'dark' ? { ...dark, mode: 'dark' } : { ...light, mode: 'light' },
    ...base,
  }
}

export default function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem('color-mode')
      return saved || 'light'
    } catch {
      return 'light'
    }
  })

  const colorMode = useMemo(() => ({
    mode,
    toggleColorMode: () => {
      setMode((prev) => {
        const next = prev === 'light' ? 'dark' : 'light'
  try { localStorage.setItem('color-mode', next) } catch (e) { void e }
        return next
      })
    }
  }), [mode])

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export { ColorModeContext }
