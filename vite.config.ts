import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Catatan: TIDAK ada proxy untuk '/oauth' — '/oauth/authorize' adalah rute
      // React (OAuthAuthorizePage) yang harus dirender oleh SPA saat aplikasi client
      // me-redirect browser ke sini. Panggilan API SPA sendiri ke /oauth/authorize
      // dan /oauth/token memakai axios baseURL absolut (lihat src/config/api.ts),
      // jadi tidak melewati proxy ini. Menambahkan proxy '/oauth' akan mencegat
      // navigasi browser ke halaman tersebut dan mengembalikan JSON backend mentah
      // alih-alih me-render halaman login.
    },
  },
});
