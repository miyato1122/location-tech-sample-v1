# 防災マップ ドキュメント一覧

本ディレクトリは、`03_advanced_with_tsumiki`（防災マップ PWA）のコードベースから逆生成されたドキュメント群です。

**生成日時**: 2026-04-20  
**対象**: `main.js`（603行）、`public/skhb/`（ベクトルタイル）、`public/manifest.json` 他

---

## ディレクトリ構成

```
docs/
├── README.md                   # このファイル
├── spec/                       # 要件・仕様
│   └── disaster-prevention-map/
│       ├── requirements.md         # 要件定義書
│       ├── user-stories.md         # ユーザーストーリー
│       ├── acceptance-criteria.md  # 受け入れ基準
│       ├── test-specs.md           # テスト仕様書
│       ├── test-cases.md           # テストケース一覧
│       └── tests/                  # 生成テストコード
│           ├── getNearestFeature.test.js
│           ├── routeRendering.test.js
│           ├── popup.test.js
│           └── e2e-map-flow.spec.js
├── design/                     # 技術設計
│   └── disaster-prevention-map/
│       ├── architecture.md         # アーキテクチャ設計
│       ├── dataflow.md             # データフロー図
│       ├── api-endpoints.md        # 外部データソース仕様
│       └── interfaces.ts           # 型定義集
└── tasks/                      # 実装タスク一覧
    ├── map-initialization/         # マップ初期化・インタラクション
    ├── hazard-map-overlay/         # ハザードマップオーバーレイ
    ├── shelter-display/            # 指定緊急避難場所表示
    ├── geolocation-routing/        # 位置情報・最近傍ルート
    ├── terrain-visualization/      # 3D地形・陰影図
    └── pwa-setup/                  # PWA設定
```

---

## spec/ — 要件・仕様ドキュメント

### [requirements.md](spec/disaster-prevention-map/requirements.md)

EARS（Easy Approach to Requirements Syntax）記法による要件定義書。実装コードから逆算して生成。

| 区分 | 件数 |
|------|-----|
| 通常要件（SHALL） | 9件 |
| 条件付き要件（WHEN/IF-THEN） | 4件 |
| 状態要件（WHERE） | 1件 |
| オプション要件（MAY） | 1件 |
| 制約要件（MUST） | 3件 |
| 非機能要件 | 12件 |

主な内容: インタラクティブマップ表示、6種ハザードマップ、8種別避難場所、位置情報ルート、3D地形、PWA対応、表示範囲制限など。

---

### [user-stories.md](spec/disaster-prevention-map/user-stories.md)

実装機能から逆算したユーザーストーリー（8件）。

| ストーリーID | 概要 |
|------------|------|
| US-001 | 周辺のハザードリスク確認 |
| US-002 | 避難場所の確認 |
| US-003 | 避難場所の詳細情報確認 |
| US-004 | 現在地から最寄り避難場所の確認 |
| US-005 | ハザードと避難場所の重ね合わせ確認 |
| US-006 | 地形を考慮した地図閲覧 |
| US-007 | スマートフォンからのアクセス |
| US-008 | オフライン環境での利用 |

---

### [acceptance-criteria.md](spec/disaster-prevention-map/acceptance-criteria.md)

機能別の受け入れ基準チェックリスト。実装済み項目と要確認項目を整理。

主な内容: 地図表示、ハザードマップ、避難場所、ポップアップ、位置情報ルート、3D地形、PWA機能の各受け入れ基準。

**要確認項目**:
- 避難場所フィーチャーが0件のとき `getNearestFeature()` がnullを返す場合のエラー（`main.js:568` のバグリスク）
- Service Worker のオフラインキャッシュが実質的に未実装

---

### [test-specs.md](spec/disaster-prevention-map/test-specs.md)

テスト仕様書。推奨テストスタックとカテゴリ別実装状況を整理。

- **現在のテストカバレッジ**: 0%（テストファイル未存在）
- **推奨テストスタック**: Vitest（単体・統合）、Playwright（E2E）
- **生成テストケース数**: 32件

---

### [test-cases.md](spec/disaster-prevention-map/test-cases.md)

32件のテストケース一覧（TC-001〜TC-032）。優先度・実装状況・参照実装・推定工数つき。

| カテゴリ | 件数 | 推定工数 |
|---------|-----|---------|
| Unit | 8件 | 10時間 |
| Integration | 12件 | 15時間 |
| E2E | 8件 | 18時間 |
| Performance | 2件 | 5時間 |
| Security | 1件 | 2時間 |
| 境界値 | 1件 | 1時間 |

---

### tests/ — 生成テストコード

実装コードから逆生成したテストコードのサンプル。実際に使用するには `main.js` のリファクタリング（関数の `export`）が必要。

| ファイル | 内容 | テストフレームワーク |
|---------|------|------------------|
| [getNearestFeature.test.js](spec/disaster-prevention-map/tests/getNearestFeature.test.js) | 最近傍施設計算ロジックのテスト（TC-001〜005）。0件バグの再現テストを含む | Vitest |
| [routeRendering.test.js](spec/disaster-prevention-map/tests/routeRendering.test.js) | ルートライン描画ロジックのテスト（TC-006〜008）。ズームレベル境界値テストを含む | Vitest |
| [popup.test.js](spec/disaster-prevention-map/tests/popup.test.js) | ポップアップ表示のテスト（TC-014〜018, TC-031）。remarksのnull対応とXSSリスク確認を含む | Vitest |
| [e2e-map-flow.spec.js](spec/disaster-prevention-map/tests/e2e-map-flow.spec.js) | 地図操作のE2Eテスト（TC-021〜028）。地図表示・ハザード切り替え・位置情報ルートなど | Playwright |

---

## design/ — 技術設計ドキュメント

### [architecture.md](design/disaster-prevention-map/architecture.md)

システムのアーキテクチャ概要。技術スタック、プロジェクト構造、アーキテクチャ特徴を記述。

主な内容:
- **構成**: クライアントサイドオンリー（バックエンドなし）の静的SPA
- **マップ**: MapLibre GL JS（WebGLレンダリング）
- **ビルド**: Vite 3.2
- **データ**: 外部タイルサーバー（OSM, GSI）+ ローカルベクトルタイル（PBF）
- **非機能**: セキュリティ・パフォーマンス・運用性の実装状況

---

### [dataflow.md](design/disaster-prevention-map/dataflow.md)

Mermaid図による7種のデータフロー図。

| フロー | 概要 |
|-------|------|
| アプリ起動フロー | ブラウザ→SW→MapLibre初期化→タイル取得 |
| ハザードマップ表示フロー | OpacityControl→レイヤー切り替え→CDNタイル取得 |
| 避難場所表示フロー | OpacityControl→フィルター切り替え→PBFタイル取得 |
| 避難場所クリックフロー | クリック→queryRenderedFeatures→Popup表示 |
| 位置情報・ルート描画フロー | GeolocateControl→毎フレーム最近傍計算→LineString描画 |
| 3D地形フロー | TerrainControl→標高タイル→WebGL 3Dレンダリング |
| カーソル変更フロー | mousemove→queryRenderedFeatures→cursor切り替え |

---

### [api-endpoints.md](design/disaster-prevention-map/api-endpoints.md)

アプリが参照する外部データソースの仕様一覧。自前APIサーバーは存在しない。

| データソース | 形式 | 用途 |
|------------|------|------|
| OpenStreetMap タイル | PNG ラスタータイル | 背景地図 |
| GSI ハザードマップ（6種） | PNG ラスタータイル | ハザードオーバーレイ |
| 指定緊急避難場所（ローカル） | PBF ベクトルタイル | 約112,525件の避難場所 |
| GSI 標高タイル | raster-dem | 3D地形・陰影図 |
| Geolocation API | ブラウザネイティブ | ユーザー現在地 |

---

### [interfaces.ts](design/disaster-prevention-map/interfaces.ts)

実装コードから推定した TypeScript 型定義集。TypeScript 移行時の参照として使用。

主な型定義:
- `SkhbProperties` — 避難場所フィーチャーのプロパティ
- `SkhbFeatureWithDistance` — 距離計算後のフィーチャー
- `HazardLayerId` / `SkhbLayerId` — レイヤーID のユニオン型
- `UserLocation` — 現在地座標（null 含む）
- `VectorTileMetadata` — Tippecanoe 生成メタデータ

---

## tasks/ — 実装タスク一覧

コードベースから逆算した実装タスク。各機能ディレクトリに `overview.md`（タスク一覧）と個別の `TASK-XXXX.md` を格納。

| ディレクトリ | 機能 | タスク数 | 推定工数 |
|------------|------|---------|---------|
| [map-initialization/](tasks/map-initialization/overview.md) | マップ初期化・クリック・ホバー | 3件 | 4時間 |
| [hazard-map-overlay/](tasks/hazard-map-overlay/overview.md) | ハザードマップオーバーレイ | 2件 | 2時間 |
| [shelter-display/](tasks/shelter-display/overview.md) | 指定緊急避難場所表示 | 3件 | 5時間 |
| [geolocation-routing/](tasks/geolocation-routing/overview.md) | 位置情報・最近傍ルート描画 | 3件 | 4時間 |
| [terrain-visualization/](tasks/terrain-visualization/overview.md) | 3D地形・陰影図 | 2件 | 2時間 |
| [pwa-setup/](tasks/pwa-setup/overview.md) | PWA設定 | 2件 | 1時間 |
| **合計** | | **15件** | **18時間** |

---

## 既知の問題・技術的負債

### バグリスク（優先度: 高）

`main.js:568` — `geolocation-routing/TASK-0002` 参照

`getNearestFeature()` が `null` を返した場合（表示中の避難場所が0件）に `nearestFeature._geometry.coordinates` の参照で `TypeError` が発生する。null チェックの追加が必要。

```javascript
// 修正案
const nearestFeature = getNearestFeature(userLocation[0], userLocation[1]);
if (!nearestFeature) return; // ← この行を追加
```

### Service Worker 未実装（優先度: 中）

`pwa-setup/TASK-0002` 参照。`public/sw.js` に fetch ハンドリングがなく、オフラインキャッシュが機能しない。

### テスト未整備（優先度: 中）

全機能のテストカバレッジが 0%。テスト導入には `main.js` の関数分離リファクタリングが前提となる。

### XSS リスク（優先度: 低）

`main.js:480-512` — ポップアップに `setHTML` で文字列テンプレートを直接渡している。ベクトルタイル属性値が外部入力でないため現状リスクは低いが、`textContent` への変更を推奨。
