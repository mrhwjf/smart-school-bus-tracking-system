import React from 'react'
import { AppBar, Toolbar, Box, InputBase, Typography, IconButton, Avatar, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import LogoutIcon from '@mui/icons-material/Logout'
import LanguageSwitcher from './LanguageSwitcher'
import { useColorMode } from '../context/colorModeData'
import { useTranslation } from 'react-i18next'
import DirectionsBusFilledIcon from '@mui/icons-material/DirectionsBusFilled'

export default function Topbar({ onSearch, onAccountClick, onLogout }) {
  const { t } = useTranslation()
  const { mode, toggleColorMode } = useColorMode()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  function handleOpenMenu(e) {
    setAnchorEl(e.currentTarget)
  }

  function handleCloseMenu() {
    setAnchorEl(null)
  }

  function handleAccount() {
    handleCloseMenu()
    if (onAccountClick) onAccountClick()
  }

  function handleLogout() {
    handleCloseMenu()
    if (onLogout) onLogout()
  }

  return (
    <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #eee' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 240 }}>
          <DirectionsBusFilledIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Smart-School-Bus</Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* language switcher placed just left of the pill */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
          <LanguageSwitcher />
        </Box>

        {/* Right rounded pill: search + icons + avatar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: (theme) => theme.palette.background.paper,
            px: 1,
            py: 0.4,
            borderRadius: 6,
            boxShadow: (theme) => theme.shadows[1],
            minWidth: 360,
            maxWidth: 520,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1, pr: 0.5, flex: 1 }}>
            <SearchIcon color="action" />
            <InputBase placeholder={t('search')} onChange={(e) => onSearch?.(e.target.value)} sx={{ ml: 1, flex: 1 }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 1 }}>
            <IconButton size="small" aria-label="notifications">
              <NotificationsNoneIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label="toggle-theme" onClick={toggleColorMode}>
              {mode === 'light' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
            <IconButton size="small" aria-label="user-menu" onClick={handleOpenMenu} sx={{ p: 0 }}>
              <Avatar alt="User" src="/avatar.png" sx={{ width: 32, height: 32 }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleCloseMenu}
              onClick={handleCloseMenu}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ sx: { minWidth: 160, borderRadius: 2 } }}
            >
              <MenuItem onClick={handleAccount}>
                <ListItemIcon>
                  <PersonOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Account info</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
