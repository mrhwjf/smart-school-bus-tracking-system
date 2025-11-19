import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  // Cho phép truy cập từ thiết bị khác trong cùng mạng LAN
  server: {
    host: true, // lắng nghe trên 0.0.0.0 thay vì chỉ localhost
    port: 5173, // giữ nguyên port mặc định của Vite
  },
})
