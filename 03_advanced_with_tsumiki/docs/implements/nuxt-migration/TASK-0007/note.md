# TASK-0007 useHazardLayers Composable TDD開発 コンテキストノート

**作成日**: 2026-04-21  
**タスクID**: TASK-0007  
**機能**: useHazardLayers composable 実装（6種ハザードマップレイヤー + OpacityControl）

---

## 1. 技術スタック

### 対象フレームワーク・ライブラリ

| 技術 | バージョン | 用途 | 備考 |
|------|-----------|------|------|
| Vue 3 | ^3.5.0 | フレームワーク（composables） | Nuxt 4に含まれる |
| Nuxt | ^4.4.2 | フルスタックフレームワーク | TASK-0001で初期化済み |
| TypeScript | ^5.0 | 言語 | strict: true |
| MapLibre GL JS | ^5.23.0 | マップライブラリ | TASK-0001でインストール |
| maplibre-gl-opacity | ^1.8.0 | レイヤーUI制御 | OpacityControl提供 |
| Vitest | ^latest | ユニットテスト | composableのテスト用 |

### 既存実装との互換性

- **既存実装**: `main.js:35-174` (ハザードマップレイヤー定義・追加)
- **既存実装**: `main.js:430-440` (OpacityControl実装)
- **ライブラリバージョン差異**: TASK-0001でインストールされたバージョンが既存よりメジャーアップ
  - maplibre-gl: ^2.4.0 → ^5.23.0
  - maplibre-gl-opacity: ^1.4.0 → ^1.8.0
  - APIの差異確認が必要

### Nuxt 4のディレクトリ構造

```
nuxt-map-app/
├── app/
│   ├── composables/  ← useHazardLayers.ts をここに配置
│   ├── components/
│   ├── pages/
│   └── app.vue
├── public/           ← 地図タイル等の静的ファイル
├── types/            ← 型定義（interfaces.ts移行先）
└── nuxt.config.ts    ← SSR: false設定済み
```

---

## 2. 開発ルール

### Nuxt 4 + Vue 3 Composition APIのコード規約

**参照元**: docs/design/nuxt-migration/architecture.md

#### Composableの書き方

```typescript
// ✅ 推奨パターン
export function useHazardLayers(map: Ref<MaplibreMap | null>): void {
  // map.value?.on('load', () => { ... })
}

// キーポイント:
// 1. 関数名は use* という命名規則
// 2. map 引数は Ref<MaplibreMap | null>
// 3. ライフサイクル管理（onMounted/onUnmounted）は MapContainer側で行う
// 4. SSR回避（onMounted内でMapLibreインポート）
```

#### TypeScript strict モード

- `non-null assertion (!)` を慎重に使用
- `?.` (optional chaining) を活用
- `null | undefined` 明示的にチェック
- 参照元: nuxt.config.ts `typescript: { strict: true }`

#### ファイルパス規約

- composable ファイル: `app/composables/useHazardLayers.ts`
- テストファイル: `tests/unit/useHazardLayers.test.ts`

### TDD開発プロセス

参照元: docs/rule/tdd/（存在する場合）

1. **Red フェーズ**: テストケース実装（失敗）
2. **Green フェーズ**: 最小実装（テスト通過）
3. **Refactor フェーズ**: コード品質向上

---

## 3. 関連実装 & 参考パターン

### 既存実装からの参考情報

#### 3.1 ハザードマップレイヤー定義

**参照元**: main.js:35-100, docs/design/nuxt-migration/interfaces.ts

6種のハザードマップ定義:
- hazard_flood-layer (洪水浸水想定区域)
- hazard_hightide-layer (高潮浸水想定区域)
- hazard_tsunami-layer (津波浸水想定区域)
- hazard_doseki-layer (土石流警戒区域)
- hazard_kyukeisha-layer (急傾斜地崩壊警戒区域)
- hazard_jisuberi-layer (地滑り警戒区域)

**実装として抽出**: `HAZARD_LAYER_DEFINITIONS` 定数
- `types/index.ts` に既に型定義と定数が存在
- composable実装時にそのまま import 可能

#### 3.2 OpacityControl の使い方

**参照元**: main.js:430-440

```javascript
// 既存実装パターン
const opacity = new OpacityControl({
  baseLayers: {
    'hazard_flood-layer': '洪水浸水想定区域',
    'hazard_hightide-layer': '高潮浸水想定区域',
    // ...
  },
});
map.addControl(opacity, 'top-left');
```

**注意**:
- `baseLayers` キー = レイヤーID（文字列）
- `baseLayers` 値 = 表示ラベル（日本語）
- 位置: `'top-left'` に固定
- map の `load` イベント後に追加する

#### 3.3 Raster Tile Source の追加パターン

**参照元**: main.js:35-100 (layers > sources)

```javascript
{
  type: 'raster',
  tiles: ['https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png'],
  minzoom: 2,
  maxzoom: 17,
  tileSize: 256,
  attribution: '<a href="https://disaportal.gsi.go.jp/">...</a>',
}
```

**実装パターン**:
- `type: 'raster'` 必須
- `tileSize: 256` 固定
- `attribution` 属性情報必須（法的要件）

### 他のComposableの参考実装

**参照元**: docs/design/nuxt-migration/architecture.md (Composables表)

- `useMap.ts`: マップ初期化・ライフサイクル管理の例（TASK-0006で実装）
- `useShelterLayers.ts`: 複数レイヤー管理の例（TASK-0008で実装）

**共通パターン**:
```typescript
import type { Ref } from 'vue'
import type { Map as MaplibreMap } from 'maplibre-gl'

export function useXxx(map: Ref<MaplibreMap | null>): void {
  map.value?.on('load', () => {
    const m = map.value!  // null assertion (map.valueは確実に存在)
    // 実装...
  })
}
```

---

## 4. 設計文書

### 関連する要件定義

**参照元**: docs/spec/nuxt-migration/requirements.md

#### REQ-020: ハザードマップレイヤーcomposable

- `useHazardLayers(map: Ref<maplibregl.Map | null>)` を提供
- 6種のハザードマップをGSIタイルから追加
- `maplibre-gl-opacity` の `OpacityControl` をそのまま使用
- 各レイヤーのデフォルト: `visibility: 'none'`
- map の `load` イベント後にレイヤーを追加

#### REQ-021: ハザードマップの不透明度制御

- `OpacityControl` を左上（`position: 'top-left'`）に配置
- 全ハザードレイヤーをひとつのコントロールに集約

### 非機能要件

**参照元**: docs/spec/nuxt-migration/requirements.md (パフォーマンス・セキュリティ)

- **NFR-001**: MapLibre GL JSのWebGLレンダリングパフォーマンスを維持
- **NFR-401**: GSI著作権表示を適切に表示（attribution）

### アーキテクチャ設計

**参照元**: docs/design/nuxt-migration/architecture.md

#### provide/inject パターン

- MapContainer.vue 内で map Ref を保持
- useHazardLayers(map) として引数で渡す
- マップインスタンスのメモリリーク防止

#### SSR無効化

- `nuxt.config.ts`: `ssr: false`
- MapLibre GLはWebGL・window・documentを使用（SSRで実行不可）

---

## 5. テスト関連情報

### Vitest設定

**参照元**: TASK-0001 (インストール済み)

- パッケージ: `@nuxt/test-utils`, `vitest`
- 設定ファイル: `vitest.config.ts`（プロジェクトルートに存在、または nuxt.config.ts に統合）
- テストディレクトリ: `tests/unit/`, `tests/e2e/`

### Composableのテストパターン

**既存ユニットテスト参考**: docs/spec/disaster-prevention-map/tests/ (参照用)

#### 基本テストケース構成

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useHazardLayers } from '~/composables/useHazardLayers'

describe('useHazardLayers', () => {
  let mapMock: any

  beforeEach(() => {
    // mapインスタンスのモック
    mapMock = {
      on: vi.fn((event, callback) => {
        if (event === 'load') callback()
      }),
      addSource: vi.fn(),
      addLayer: vi.fn(),
      addControl: vi.fn(),
    }
  })

  it('should add 6 hazard layers on map load', () => {
    const map = ref(mapMock)
    useHazardLayers(map)
    expect(mapMock.addSource).toHaveBeenCalledTimes(6)
    expect(mapMock.addLayer).toHaveBeenCalledTimes(6)
  })
})
```

### テスト環境構築のチェックリスト

- [ ] vitest がインストール済み (TASK-0001で実行)
- [ ] @nuxt/test-utils がインストール済み
- [ ] vitest.config.ts または nuxt.config.ts にテスト設定が存在
- [ ] maplibre-gl のモック設定（`vitest.config.ts` の `deps.inline`）

**注意**: maplibre-gl は ES module の外部依存関係のため、Vitestの `deps.inline` に含める必要がある可能性

```typescript
// vitest.config.ts (例)
export default defineConfig({
  test: {
    environment: 'jsdom', // または 'happy-dom'
    globals: true,
  },
  ssr: {
    noExternal: ['maplibre-gl'],
  },
})
```

---

## 6. 注意事項 & 技術的制約

### 重要な実装制約

#### 6.1 SSR禁止

- MapLibre GLはSSR環境（Node.js）で実行不可
- `onMounted` 内でのみMapLibre呼び出し
- nuxt.config.ts: `ssr: false` で全ページCSR化

**実装時の対策**:
```typescript
// ❌ トップレベルでのMapLibre import（SSRで失敗）
import { Map as MaplibreMap } from 'maplibre-gl'

// ✅ onMounted 内での遅延 import
onMounted(() => {
  const { OpacityControl } = await import('maplibre-gl-opacity')
})
```

#### 6.2 null安全性

- `map.value?.on()` optional chaining を必須
- `const m = map.value!` は `on('load')` コールバック内のみ使用
- 外側では map.value が null の可能性あり

#### 6.3 ライブラリバージョン差異

**TASK-0001でインストール済みバージョン**:
- maplibre-gl: ^5.23.0 (既存 ^2.4.0)
- maplibre-gl-opacity: ^1.8.0 (既存 ^1.4.0)

**確認項目**:
- `OpacityControl` API が `baseLayers` (新版) or `overLayers` (旧版) かを確認
- TASK-0007のテストコード参照: `HAZARD_LAYER_DEFINITIONS` から自動生成

参照元: docs/implements/nuxt-migration/TASK-0001/setup-report.md の「メジャーバージョン差異」セクション

### パフォーマンス考慮

- 6種のレイヤーを一度に追加（`map.addLayer` × 6回）
- `visibility: 'none'` でデフォルト非表示
- OpacityControl UI切り替え時のみ可視化

### セキュリティ

- **XSS回避**: OpacityControl は Vanilla JSライブラリのため、属性情報は直接文字列
- **著作権表示**: attribution属性を必ず設定（NFR-401）

**GSI attributionテンプレート**:
```html
<a href="https://disaportal.gsi.go.jp/">国土地理院ハザードマップポータルサイト</a>
```

### Maplibre-gl-opacity のAPI確認

**推奨チェック**: npm パッケージのドキュメント

- `OpacityControl` constructor パラメータ形式
  - 旧版: `overLayers`
  - 新版: `baseLayers` (オブジェクト形式)
- `addControl(control, position)` は同一

---

## 7. 実装チェックリスト

### コード実装

- [ ] `app/composables/useHazardLayers.ts` を作成
- [ ] `HAZARD_LAYER_DEFINITIONS` から 6種ハザードマップループ処理
- [ ] `map.addSource(sourceId, rasterSource)` で各レイヤーソース追加
- [ ] `map.addLayer(layerConfig)` で各レイヤー追加
- [ ] `visibility: 'none'` をデフォルト設定
- [ ] `OpacityControl` を初期化（baseLayers オブジェクト生成）
- [ ] `map.addControl(opacityControl, 'top-left')` で左上配置
- [ ] TypeScript strict エラーなし

### テスト実装

- [ ] `tests/unit/useHazardLayers.test.ts` を作成
- [ ] MapLibre mock を設定
- [ ] 「6種レイヤー追加」テスト
- [ ] 「OpacityControl を left-top 配置」テスト
- [ ] 「各レイヤー visibility: 'none'」テスト
- [ ] 「load イベント後の実行」テスト

### 品質確認

- [ ] TypeScript strict: true でコンパイルエラーなし
- [ ] Vitest ユニットテスト全カバー
- [ ] 既存実装 main.js:35-174 との動作整合性確認

---

## 8. 関連ファイル一覧

### 参照元資料

- `docs/tasks/nuxt-migration/TASK-0007.md` — タスク定義
- `docs/spec/nuxt-migration/requirements.md` — REQ-020, REQ-021
- `docs/spec/nuxt-migration/note.md` — 技術スタック確認
- `docs/design/nuxt-migration/architecture.md` — アーキテクチャ・Composable設計
- `docs/design/nuxt-migration/interfaces.ts` — `HAZARD_LAYER_DEFINITIONS` 型定義
- `main.js:35-100` — ハザードマップレイヤー定義（既存実装）
- `main.js:430-440` — OpacityControl実装（既存実装）

### 実装対象

- `app/composables/useHazardLayers.ts` (新規作成)
- `tests/unit/useHazardLayers.test.ts` (新規作成)

### インポート先

- `app/components/MapContainer.vue` (TASK-0013で実装)

---

## 9. 次のステップ

1. **TASK-0007 [step-b]**: tdd-requirements で要件定義を詳細化
2. **TASK-0007 [step-c]**: tdd-testcases でテストケース洗い出し
3. **TASK-0007 [step-d]**: tdd-red でテスト実装（失敗）
4. **TASK-0007 [step-e]**: tdd-green で最小実装（テスト通過）
5. **TASK-0007 [step-f]**: tdd-refactor でリファクタリング
6. **TASK-0007 [step-g]**: tdd-verify-complete で品質確認

---

**ノート作成者**: Claude Code  
**作成日時**: 2026-04-21
