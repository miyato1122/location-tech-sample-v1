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

  // PWA 設定（Task 3.4 で詳細設定）
  pwa: {},

  compatibilityDate: '2025-04-20',
})
