import { createContext, useContext } from 'react'

const ColorModeContext = createContext({ mode: 'light', toggleColorMode: () => {} })

export function useColorMode() {
  return useContext(ColorModeContext)
}

export default ColorModeContext
