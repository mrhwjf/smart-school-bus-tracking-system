import { useTranslation } from 'react-i18next'
import { MenuItem, Select } from '@mui/material'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language || 'vi'
  return (
    <Select
      value={current}
      onChange={(e) => {
        const v = e.target.value
        i18n.changeLanguage(v)
        try {
          localStorage.setItem('appLang', v)
        } catch (err) {
          // ignore
        }
      }}
      size="small"
      sx={{ minWidth: 120 }}
    >
      <MenuItem value="vi">Tiếng Việt</MenuItem>
      <MenuItem value="en">English</MenuItem>
    </Select>
  )
}
