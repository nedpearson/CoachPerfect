import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  // Serve static assets (index.html, diagnostic.html, etc.) from public/
  publicDir: 'public',
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Forward API calls to the Express API server
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
