import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'

export default function ConfirmDialog({ open, title, message, cancelText = 'Cancel', okText = 'OK', onCancel, onOk }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      {title && <DialogTitle>{title}</DialogTitle>}
      {message && (
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button variant="contained" color="error" onClick={onOk}>{okText}</Button>
      </DialogActions>
    </Dialog>
  )
}
