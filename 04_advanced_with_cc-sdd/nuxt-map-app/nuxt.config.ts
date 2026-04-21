// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],

  // MapLibre は SSR 非対応のため全ページを CSR 専用にする
  ssr: false,

  // TypeScript strict モード（strict: true は tsconfig.json で設定）
  typescript: {
    strict: true,
  },

  // グローバルスタイル（maplibre-gl.css を含む）
  css: ['~/assets/styles/main.css'],

  // サブパス配信に対応するためベース URL を環境変数から取得可能にする
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/',
  },

  // PWA 設定
  pwa: {
    manifest: {
      name: '防災マップ',
      short_name: '防災マップ',
      theme_color: '#2185f3',
      icons: [
        {
          src: 'icons/icon192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'icons/icon512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      runtimeCaching: [
        {
          // ローカル SKHB ベクトルタイル: CacheFirst
          urlPattern: /\/skhb\/.*\.pbf$/,
          handler: 'CacheFirst' as const,
          options: {
            cacheName: 'skhb-tiles',
            expiration: { maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
        {
          // 外部タイル (OSM・ハザード・地理院): NetworkFirst
          urlPattern:
            /^https:\/\/(tile\.openstreetmap\.org|disaportaldata\.gsi\.go\.jp|cyberjapandata\.gsi\.go\.jp)\/.*/,
          handler: 'NetworkFirst' as const,
          options: {
            cacheName: 'external-tiles',
            expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
          },
        },
      ],
    },
  },

  compatibilityDate: '2025-04-20',
})
