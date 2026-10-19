import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 127.0.0.1 so http://localhost:5173 works in every browser (some only try IPv4)
  server: { host: '127.0.0.1', port: 5173 },
})
