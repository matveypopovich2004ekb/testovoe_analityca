import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
