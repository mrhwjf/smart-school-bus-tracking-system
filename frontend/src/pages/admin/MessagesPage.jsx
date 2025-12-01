import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { AdminService } from '../../api/services'
import { useTranslation } from 'react-i18next'

export default function MessagesPage() {
  const [rows, setRows] = useState([])
  const { t } = useTranslation()
  useEffect(() => {
    AdminService.listMessages().then((data) => {
      // Chuẩn hóa dữ liệu về mảng
      let items = Array.isArray(data) ? data : []
      if (!Array.isArray(data) && data && typeof data === 'object') {
        if (Array.isArray(data.items)) items = data.items
        else if (Array.isArray(data.rows)) items = data.rows
      }
      setRows(items)
    })
  }, [])
  const formatDate = (v) => {
    if (!v) return ''
    // Hỗ trợ định dạng 'YYYY-MM-DD HH:mm:ss' từ DB
    const s = typeof v === 'string' ? v.replace(' ', 'T') : v
    const d = new Date(s)
    return isNaN(d.getTime()) ? '' : d.toLocaleString()
  }
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>{t('messages')}</Typography>
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nội dung</TableCell>
              <TableCell>Thời gian</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.message_id} hover>
                <TableCell>{r.message_id}</TableCell>
                <TableCell>{r.message_text}</TableCell>
                <TableCell>{formatDate(r.sent_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  )
}
