// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,

  modules: [
    '@vite-pwa/nuxt',
  ],

  pwa: {
    manifest: {
      name: '防災マップ',
      short_name: '防災マップ',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#3388ff',
      orientation: 'any',
      start_url: '/',
      scope: '/',
      icons: [
        { src: 'icon192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icon256.png', sizes: '256x256', type: 'image/png' },
        { src: 'icon384.png', sizes: '384x384', type: 'image/png' },
        { src: 'icon512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,ico}'],
      globIgnores: ['skhb/**'],
    },
    devOptions: {
      enabled: false,
    },
  },

  typescript: {
    strict: true,
  },
})
