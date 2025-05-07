import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'
dotenv.config()

// Get API URL from environment variables or use defaults
const apiProxyUrl = process.env.API_URL

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: apiProxyUrl,
        changeOrigin: true
      }
    }
  },
  define: {
    // Make environment variables available to the client code
    'process.env.API_URL': JSON.stringify(apiProxyUrl)
  }
})
