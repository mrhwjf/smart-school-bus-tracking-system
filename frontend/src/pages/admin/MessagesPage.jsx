import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { AdminService } from '../../api/services'
import { useTranslation } from 'react-i18next'

export default function MessagesPage() {
  const [rows, setRows] = useState([])
  const { t } = useTranslation()
  useEffect(() => {
    AdminService.listMessages().then(setRows)
  }, [])
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
                <TableCell>{new Date(r.sent_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  )
}
