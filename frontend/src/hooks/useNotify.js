import { useContext } from 'react'
import { NotificationContext } from '../context/NotificationContext.js'

export function useNotify() {
  return useContext(NotificationContext)
}
