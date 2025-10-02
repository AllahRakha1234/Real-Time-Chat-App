// vite.config.js
import structuredClonePoly from '@ungap/structured-clone'

// Polyfill `structuredClone` globally if not present
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = structuredClonePoly
}

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
