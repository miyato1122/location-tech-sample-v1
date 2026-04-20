# nuxt-map-app

防災マップPWA（Nuxt 4 + Vue 3 Composition API）

## 概要

- フレームワーク: Nuxt 4 (SSR無効, CSRのみ)
- 言語: TypeScript (strict: true)
- マップ: MapLibre GL JS
- PWA: @vite-pwa/nuxt
- テスト: Vitest (unit) + Playwright (E2E)

## 開発コマンド

### アプリケーション実行

```bash
# 開発サーバー起動 (http://localhost:3000)
npm run dev

# ビルド
npm run build

# ビルド後プレビュー
npm run preview

# 静的ファイル生成
npm run generate
```

### テスト実行

```bash
# Vitestユニットテスト
npx vitest run

# Vitestウォッチモード
npx vitest

# Playwright E2Eテスト
npx playwright test
```

### 型チェック

```bash
# Nuxt型生成
npm run postinstall

# TypeScript型チェック
npx nuxi typecheck
```

## ディレクトリ構造

```
nuxt-map-app/
├── app/
│   ├── pages/index.vue          # ルートページ
│   ├── components/
│   │   ├── MapContainer.vue     # マップコンテナ
│   │   └── ShelterPopup.vue     # 避難場所ポップアップ
│   ├── composables/
│   │   ├── useMap.ts
│   │   ├── useHazardLayers.ts
│   │   ├── useShelterLayers.ts
│   │   ├── useGeolocation.ts
│   │   ├── useRoute.ts
│   │   └── useTerrain.ts
│   └── app.vue
├── types/index.ts               # 全型定義
├── public/skhb/                 # ベクトルタイル(PBF)
├── tests/
│   ├── unit/
│   └── e2e/
└── nuxt.config.ts
```

## 注意事項

- `ssr: false` 必須（MapLibre GL JS はブラウザ専用）
- `maplibregl` のインポートは `onMounted` 内で行うこと
- ベクトルタイル (`public/skhb/`) は100MB超のため git LFS 推奨
