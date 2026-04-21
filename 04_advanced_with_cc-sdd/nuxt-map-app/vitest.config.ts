import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [vue()],
  test: {
    // jsdom 環境を使用（MapLibre GL JS はモックで代替）
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      // ~ エイリアスを nuxt-map-app のルートに解決
      '~': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
