import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@mui/icons-material')) {
            return 'vendor-mui-icons';
          }
          if (id.includes('node_modules/@mui/material') || id.includes('node_modules/@mui/system')) {
            return 'vendor-mui-core';
          }
          if (id.includes('node_modules/@emotion/')) {
            return 'vendor-emotion';
          }
        },
      },
    },
  },
});
