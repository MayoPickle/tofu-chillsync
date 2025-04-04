import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",  // 允许外部访问
    port: 3000,
    strictPort: true,
    allowedHosts: ["chillsync.yudoufu.org"], // 允许的域名
    proxy: {
      '/api': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5010',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
