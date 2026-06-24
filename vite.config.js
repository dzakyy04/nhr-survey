import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ['VITE_', 'API_'],
  server: {
    proxy: {
      '/oauth/token': {
        target: 'https://rsmh-dev.medxa.net/ords/rsmh',
        changeOrigin: true
      }
    }
  },
})
