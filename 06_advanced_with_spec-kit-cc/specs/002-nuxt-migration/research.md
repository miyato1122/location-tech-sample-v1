# リサーチ結果: Nuxt移行とライブラリ更新

**作成日**: 2026-04-22  
**対象フィーチャー**: 002-nuxt-migration

---

## 1. maplibre-gl v2 → v5 の破壊的変更

### 決定事項
maplibre-gl を v2.4.0 から最新安定版（v5.x）へ更新する。

### 主な破壊的変更と対応方針

| 変更内容 | v2 の書き方 | v5 の対応 |
|---------|------------|----------|
| `addProtocol` の移動 | `maplibregl.addProtocol(...)` | `import { addProtocol } from 'maplibre-gl'` として named import で使用 |
| `GeolocateControl._watchState` | プライベートプロパティを直接参照 | `trackuserlocationend` / `trackuserlocationstart` イベントで代替 |
| `feature._geometry` | querySourceFeatures 結果の内部プロパティ | 標準GeoJSON `feature.geometry.coordinates` に変更 |
| CSS import パス | `maplibre-gl/dist/maplibre-gl.css` | 同パスのまま変更なし（v5 も同様） |

### 根拠
- `addProtocol` は v3 以降で named export に移行。`maplibregl.addProtocol` は後方互換で残存する可能性があるが、新構文に揃える
- `_watchState` はプライベートAPIのため v4 で削除されている可能性が高い。イベントベースの実装に変更する
- `_geometry` は maplibre-gl v2 の内部実装に依存したアクセスであり、v3 以降で削除済み。`feature.geometry` が標準

### 代替手段として検討したもの
- v3 へのマイナー更新のみ → v5 まで一気に上げることで将来の更新コストを削減
- `maplibregl.addProtocol` 維持 → 後方互換が確認できないため named export 採用

---

## 2. maplibre-gl-gsi-terrain の互換性

### 決定事項
`maplibre-gl-gsi-terrain` の最新版を使用する。内部で `addProtocol` を受け取る引数として渡す構造のため、**呼び出し側が named import した `addProtocol` を渡す**形に変更する。

### 現行コード
```js
const gsiTerrainSource = useGsiTerrainSource(maplibregl.addProtocol);
```

### 新コード（予定）
```js
import { addProtocol } from 'maplibre-gl';
const gsiTerrainSource = useGsiTerrainSource(addProtocol);
```

### 根拠
`maplibre-gl-gsi-terrain` の `useGsiTerrainSource` は関数を引数として受け取るため、どちらの addProtocol を渡してもシグネチャが一致すれば動作する。

---

## 3. maplibre-gl-opacity の互換性

### 決定事項
`maplibre-gl-opacity` は最新版（現時点 v1.4.0）を使用し、動作確認する。互換性問題が発生した場合は自前の opacity コントロールに置き換える。

### 根拠
`maplibre-gl-opacity` はライブラリの更新が少ないが、maplibre-gl の公開 API（`map.setLayoutProperty`, `map.setPaintProperty`）のみを使用する実装であるため、v5 でも動作する可能性が高い。

### リスク
- maplibre-gl v5 で内部のイベント名・API が変更された場合、opacity コントロールが機能しなくなる可能性がある
- その場合は CSS `opacity` + `visibility` を直接操作するシンプルな実装に置き換える

---

## 4. Nuxt SPA モードの設定

### 決定事項
`nuxt.config.ts` で `ssr: false` を設定し、SPAとしてビルドする。

```ts
export default defineNuxtConfig({
  ssr: false,
})
```

### 根拠
maplibre-gl は `window`・`document`・WebGL を使用するため、サーバーサイドレンダリングと根本的に相容れない。`ssr: false` でクライアント専用アプリとして構成することで、`onMounted` 内で安全に初期化できる。

### 代替として検討したもの
- `<ClientOnly>` コンポーネントでラップ → `ssr: false` + シングルページで十分なため不要
- `process.client` チェック → `onMounted` で代替可能

---

## 5. ベクタータイル（skhb）の URL 解決

### 決定事項
Nuxt では `import.meta.env.BASE_URL` を使用してベースURLを取得する。

### 現行コード
```js
`${location.href.replace('/index.html', '')}/skhb/{z}/{x}/{y}.pbf`
```

### 新コード（予定）
```js
`${window.location.origin}${import.meta.env.BASE_URL}skhb/{z}/{x}/{y}.pbf`
```

ただし、Nuxt の `public/` ディレクトリに `skhb/` を配置すれば、ルートからの絶対パス `/skhb/{z}/{x}/{y}.pbf` で参照可能。

### 根拠
Nuxt の `public/` ディレクトリの内容は本番ビルドでもルートに配置されるため、`/skhb/` パスで安定参照できる。

---

## 6. プライベート API の置き換え詳細

### `_watchState` の代替

**目的**: GeolocateControl が「オフ」の場合に `userLocation` をクリアする

```js
// v2（現行） - プライベートAPI使用
if (geolocationControl._watchState === 'OFF') userLocation = null;

// v5（新） - イベントリスナーで管理
geolocationControl.on('trackuserlocationend', () => {
    userLocation = null;
});
```

### `_geometry` の代替

**目的**: querySourceFeatures の結果からジオメトリ座標を取得する

```js
// v2（現行） - プライベートプロパティ
nearestFeature._geometry.coordinates

// v5（新） - 標準GeoJSON
nearestFeature.geometry.coordinates
```

---

## 7. Nuxt プロジェクト構造の決定

### 決定事項
シンプルさ優先（憲法 原則V）のため、単一コンポーネント構成を採用する。

```
nuxt-apps/
├── pages/
│   └── index.vue        # メインページ（地図全画面）
├── components/
│   └── TheMap.vue       # 地図コンポーネント（onMounted内でmap初期化）
├── public/
│   └── skhb/            # ベクタータイル（現行 public/skhb/ のコピー）
├── assets/
│   └── css/
│       └── main.css     # グローバルCSS（#basemap-control等）
└── nuxt.config.ts       # ssr: false, CSS設定
```

### 根拠
- 地図アプリは基本的に単一画面のため、複数ページ構成は不要
- 地図ロジックを `TheMap.vue` に集約することで、Vueコンポーネントのライフサイクルと同期が取れる
- `nuxt-apps` での検証完了後、ルートへの移植も容易

---

## 8. CSS の処理方法

### 決定事項
- maplibre-gl / maplibre-gl-opacity の CSS は `nuxt.config.ts` の `css` 配列で読み込む
- `#basemap-control` などのカスタムCSSは `assets/css/main.css` に移行

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: [
    'maplibre-gl/dist/maplibre-gl.css',
    'maplibre-gl-opacity/dist/maplibre-gl-opacity.css',
  ],
})
```

---

## 9. PWA（Service Worker）の扱い

### 決定事項
`nuxt-apps` での初期移行では PWA は対象外とし、Service Worker の実装は省略する。動作確認後、必要であれば `@vite-pwa/nuxt` モジュールで対応する。

### 根拠
PWA 機能はコア機能（地図表示）とは独立しているため、移行の複雑性を抑えるために除外する。
