# 防災マップ テスト仕様書（逆生成）

## 分析概要

**分析日時**: 2026-04-20  
**対象コードベース**: `03_advanced_with_tsumiki/`  
**テストカバレッジ**: 0%（テストファイル未存在）  
**生成テストケース数**: 32個  
**実装推奨テスト数**: 32個（全件未実装）

---

## 現在のテスト実装状況

### テストフレームワーク

現在、テストフレームワークはインストールされていない。`package.json` にはテスト関連の依存関係・スクリプトが存在しない。

### 推奨テストスタック（Vanilla JS 構成向け）

| 用途 | 推奨ツール | 理由 |
|------|-----------|------|
| 単体テスト | Vitest | Vite との相性が良い、ES Module 対応 |
| E2Eテスト | Playwright | MapLibre GL JS のレンダリングテストが可能 |
| カバレッジ | @vitest/coverage-v8 | Vitest 付属 |

---

## テストカテゴリ別実装状況

### 単体テスト（Unit Test）

- [ ] `getCurrentSkhbLayerFilter()` — 表示中レイヤーフィルター取得ロジック
- [ ] `getNearestFeature()` — 最近傍施設計算ロジック（@turf/distance 利用）
- [ ] ルートライン生成 — GeoJSON LineString 生成ロジック
- [ ] ズームレベル閾値判定 — zoom < 7 の境界値ロジック

### 統合テスト（Integration Test）

- [ ] MapLibre GL JS マップ初期化
- [ ] ベクトルタイル読み込みと表示
- [ ] OpacityControl レイヤー切り替え
- [ ] GeolocateControl イベント連動

### E2Eテスト（End-to-End Test）

- [ ] 地図初期表示フロー
- [ ] ハザードマップ表示/非表示フロー
- [ ] 避難場所選択〜ポップアップ表示フロー
- [ ] 位置情報取得〜ルート表示フロー
- [ ] 3D地形ON/OFFフロー

---

## テスト環境設定推奨

### Vitest 設定（vite.config.js に追加）

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        environment: 'jsdom',  // DOM環境
        globals: true,
        setupFiles: ['./tests/setup.js'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['main.js'],
        },
    },
});
```

### MapLibre GL JS モック設定（tests/setup.js）

```javascript
// tests/setup.js
import { vi } from 'vitest';

// MapLibre GL JS は WebGL に依存するため jsdom 環境ではモックが必要
vi.mock('maplibre-gl', () => ({
    default: {
        Map: vi.fn(() => ({
            on: vi.fn(),
            addControl: vi.fn(),
            addSource: vi.fn(),
            addLayer: vi.fn(),
            getStyle: vi.fn(() => ({ layers: [] })),
            getSource: vi.fn(() => ({ setData: vi.fn() })),
            getZoom: vi.fn(() => 10),
            getCanvas: vi.fn(() => ({ style: {} })),
            queryRenderedFeatures: vi.fn(() => []),
            querySourceFeatures: vi.fn(() => []),
            setTerrain: vi.fn(),
        })),
        GeolocateControl: vi.fn(() => ({
            on: vi.fn(),
            _watchState: 'OFF',
        })),
        Popup: vi.fn(() => ({
            setLngLat: vi.fn().mockReturnThis(),
            setHTML: vi.fn().mockReturnThis(),
            setMaxWidth: vi.fn().mockReturnThis(),
            addTo: vi.fn().mockReturnThis(),
        })),
        TerrainControl: vi.fn(),
        addProtocol: vi.fn(),
    },
}));

// @turf/distance モック
vi.mock('@turf/distance', () => ({
    default: vi.fn((from, to) => {
        // 簡易距離計算（テスト用）
        const dx = from[0] - to[0];
        const dy = from[1] - to[1];
        return Math.sqrt(dx * dx + dy * dy) * 111; // 概算km
    }),
}));
```

---

## テスト優先度

### 高優先度（即座に実装推奨）

1. **`getNearestFeature()` の null 返却バグ修正確認テスト**  
   既知のバグリスク（`main.js:568`）を再現・検証するテスト

2. **最近傍計算の正確性テスト**  
   複数施設が存在するときに本当に最近傍が返るかの検証

3. **レイヤーフィルター取得テスト**  
   表示中レイヤーのフィルター条件が正しく返るかの検証

### 中優先度（次フェーズで実装）

4. E2Eによる地図表示フロー
5. ポップアップ表示の正確性
6. ズームレベル境界値テスト（zoom 6→7の遷移）

### 低優先度（継続的改善）

7. パフォーマンステスト（112,525件のタイルデータでの最近傍計算速度）
8. アクセシビリティテスト
9. モバイル表示テスト
