import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true,
  },
  server: {
    allowedHosts: ['varsha-homemade-admin.onrender.com', 'varsha-homemade-cms-ui.onrender.com'],
    host: '0.0.0.0',
    port: 5173,
  },
})
