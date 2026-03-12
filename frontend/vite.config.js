import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    ...(command === 'build'
      ? [
          VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'script',
            workbox: {
              globPatterns: ['**/*.{js,css,html,ico,png,svg}']
            },
            manifest: {
              name: 'SehatSetu AI',
              short_name: 'SehatSetu',
              description: 'Aapka digital swasthya saathi',
              theme_color: '#0A6E6E',
              background_color: '#E8F5F5',
              display: 'standalone',
              icons: [
                {
                  src: '/icon-192x192.png',
                  sizes: '192x192',
                  type: 'image/png'
                },
                {
                  src: '/icon-512x512.png',
                  sizes: '512x512',
                  type: 'image/png'
                }
              ]
            }
          })
        ]
      : [])
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
}));
