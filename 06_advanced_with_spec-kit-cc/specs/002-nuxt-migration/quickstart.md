# クイックスタート: Nuxt移行

**作成日**: 2026-04-22  
**対象**: nuxt-apps での動作確認〜プロジェクトルートへの置き換え

---

## 前提条件

- Node.js 18 以上がインストールされていること
- 作業ディレクトリ: `06_advanced_with_spec-kit-cc/`

---

## Step 1: nuxt-apps プロジェクトの作成

```bash
# プロジェクトルートから
cd 06_advanced_with_spec-kit-cc

# Nuxtプロジェクトを nuxt-apps ディレクトリに作成
npx nuxi@latest init nuxt-apps
cd nuxt-apps
```

インタラクティブ設定が聞かれた場合:
- パッケージマネージャー: **npm**
- TypeScript: **はい**（デフォルト）
- その他: デフォルトを選択

---

## Step 2: 依存ライブラリのインストール

```bash
cd nuxt-apps
npm install maplibre-gl maplibre-gl-opacity maplibre-gl-gsi-terrain @turf/distance
```

---

## Step 3: nuxt.config.ts の設定

`nuxt-apps/nuxt.config.ts` を以下の内容に更新:

```ts
export default defineNuxtConfig({
  ssr: false,
  css: [
    'maplibre-gl/dist/maplibre-gl.css',
    'maplibre-gl-opacity/dist/maplibre-gl-opacity.css',
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
```

---

## Step 4: 静的ファイルのコピー

ベクタータイルを `nuxt-apps/public/` にコピー:

```bash
# nuxt-apps ディレクトリから
cp -r ../public/skhb ./public/skhb
```

---

## Step 5: コンポーネントの作成

`nuxt-apps/components/TheMap.vue` を作成（詳細は `data-model.md` 参照）。

`nuxt-apps/pages/index.vue` を作成:

```vue
<template>
  <div style="margin: 0">
    <TheMap />
  </div>
</template>
```

---

## Step 6: グローバルCSS の追加

`nuxt-apps/assets/css/main.css` を作成し、`style.css` の内容を移行。

`nuxt.config.ts` の `css` 配列に追加:

```ts
css: [
  'maplibre-gl/dist/maplibre-gl.css',
  'maplibre-gl-opacity/dist/maplibre-gl-opacity.css',
  '~/assets/css/main.css',
],
```

---

## Step 7: 開発サーバーの起動と動作確認

```bash
cd nuxt-apps
npm run dev
```

ブラウザで `http://localhost:3000` を開き、以下を確認:

- [ ] 地図が正常に表示される（OSM背景地図）
- [ ] 背景地図切り替え（OSM / 地理院地図 / 航空写真）が動作する
- [ ] 不透明度コントロール（左上・右上）が表示される
- [ ] ハザードマップレイヤーの表示切り替えが動作する
- [ ] 避難場所レイヤーの表示切り替えが動作する
- [ ] 地図クリックでポップアップが表示される
- [ ] GSI地形（3D地形・陰影図）が動作する
- [ ] コンソールエラー・警告が出ない

---

## Step 8: プロダクションビルド確認

```bash
cd nuxt-apps
npm run build
npm run preview
```

ビルドエラーがなく、プレビューが正常に動作することを確認。

---

## Step 9: プロジェクトルートへの置き換え（Step 7-8 完了後）

```bash
# プロジェクトルート (06_advanced_with_spec-kit-cc/) から
# バニラJS固有ファイルの削除
rm index.html main.js style.css

# nuxt-apps の内容をルートに移行（詳細はタスクリスト参照）
```

ルートへの置き換え後、`npm run dev` でルートから起動できることを確認。

---

## トラブルシューティング

### maplibre-gl が SSR エラーになる場合
`nuxt.config.ts` で `ssr: false` が設定されているか確認する。

### `addProtocol` が undefined になる場合
```ts
// NG: maplibregl.addProtocol
// OK:
import { addProtocol } from 'maplibre-gl'
const gsiTerrainSource = useGsiTerrainSource(addProtocol)
```

### skhb タイルが読み込めない場合
`nuxt-apps/public/skhb/` にタイルファイルが存在するか確認する。
URL は `/skhb/{z}/{x}/{y}.pbf` 形式で参照できる。

### maplibre-gl-opacity が動作しない場合
maplibre-gl v5 との互換性問題の可能性がある。
`map.setLayoutProperty` / `map.setPaintProperty` を使った独自実装に切り替える。
