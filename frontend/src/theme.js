import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#2e7d32' },
    warning: { main: '#f97316', dark: '#ea580c' },
    background: { default: '#f7f9fc' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
  },
})

export default theme
