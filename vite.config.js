import { defineConfig } from 'vite';

export default defineConfig({

  base: process.env.VITE_BASE_URL ?? '/family-tree/',

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
