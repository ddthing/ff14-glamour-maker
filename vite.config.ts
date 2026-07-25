import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Keep XIVAPI proxy as fallback
      '/xivapi': {
        target: 'https://v2.xivapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/xivapi/, ''),
      },
    },
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 코어
          'vendor-react': ['react', 'react-dom'],
          // i18n
          'vendor-i18n': ['react-i18next', 'i18next'],
          // UI 라이브러리
          'vendor-ui': ['lucide-react'],
        },
      },
    },
  },
})

