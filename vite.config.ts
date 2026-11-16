import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['watch-list.noext.cyou'],
  },
  preview: {
    host: true,
    allowedHosts: ['watch-list.noext.cyou'],
  },
})