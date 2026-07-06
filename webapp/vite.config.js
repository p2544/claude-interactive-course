import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Content JSON (ch0.json ... appendixB.json) is the main contributor to
// bundle size — some chapters run 150kB+ raw. Giving each content file its
// own output chunk (instead of bundling all of it together with the app
// code) keeps every individual chunk comfortably under Rollup's 500kB
// warning threshold, without changing how or when any content loads.
function manualChunks(id) {
  if (id.includes('/src/content/') && id.endsWith('.json')) {
    const name = id.split('/').pop().replace(/\.json$/, '')
    return `content-${name}`
  }
  if (id.includes('node_modules')) {
    if (id.includes('react-router')) return 'vendor-router'
    if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler')) return 'vendor-react'
    return 'vendor'
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: { manualChunks },
    },
  },
})
