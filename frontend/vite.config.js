import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {config} from 'dotenv'
config()
// https://vite.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: [react()],
  server: {
    allowedHosts: ['c7f5a932ca76.ngrok-free.app']
  }
})
