import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    // Use base path only for production build (GitHub Pages)
    base: command === 'build' ? '/SDSHC-cost-share-dashboard/' : '/',
  }
})
