import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // For GitHub Pages project sites, set VITE_BASE="/<repo-name>/"
  base: process.env.VITE_BASE || '/',
  server: {
    port: 5173,
    // Optional alternative to VITE_API_BASE_URL: call '/api/...' from the browser
    // and let Vite forward requests to Django.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
