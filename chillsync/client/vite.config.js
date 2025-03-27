import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
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