import { Alert, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export default function Assignments() {
  const { t } = useTranslation()
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>{t('assignments')}</Typography>
      <Alert severity="info">
        Mô-đun này cho phép phân công tài xế và xe cho từng tuyến/chuyến. (UI demo – cần kết nối API thực)
      </Alert>
    </>
  )
}
