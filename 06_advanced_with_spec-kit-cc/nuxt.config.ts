// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // maplibre-glはブラウザ専用のためSSRを無効化
  ssr: false,
  css: [
    'maplibre-gl/dist/maplibre-gl.css',
    '~/assets/css/maplibre-gl-opacity.css',
    '~/assets/css/main.css',
  ],
  app: {
    head: {
      title: '位置情報アプリケーション開発実践編',
      meta: [
        { charset: 'UTF-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      ],
    },
  },
})
