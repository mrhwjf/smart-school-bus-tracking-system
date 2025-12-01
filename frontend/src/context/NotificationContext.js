import { createContext } from 'react'

export const NotificationContext = createContext({ success: () => {}, error: () => {} })
