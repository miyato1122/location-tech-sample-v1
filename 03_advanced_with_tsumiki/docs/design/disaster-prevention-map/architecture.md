# 防災マップ アーキテクチャ設計（逆生成）

## 分析日時

2026-04-20

---

## システム概要

### 実装されたアーキテクチャ

- **パターン**: モノリシック・シングルページアプリケーション（SPA）。フレームワークを使わないVanilla JavaScript構成
- **構成**: フロントエンドのみ。バックエンドサーバーなし（静的サイト）
- **データソース**: すべて外部タイルサーバー（CDN）からの参照。ユーザーデータの永続化なし

---

## 技術スタック

### フロントエンド

| 区分 | 技術 | バージョン | 役割 |
|------|------|-----------|------|
| マップライブラリ | MapLibre GL JS | ^2.4.0 | インタラクティブマップのレンダリング（WebGL） |
| 地理空間演算 | @turf/distance | ^6.5.0 | 地点間距離計算（最近傍施設の特定） |
| レイヤー制御UI | maplibre-gl-opacity | ^1.4.0 | ハザードマップ・避難場所レイヤーの表示コントロール |
| 地形データ | maplibre-gl-gsi-terrain | ^0.0.2 | 国土地理院標高タイルの読み込みと3D地形化 |
| ビルドツール | Vite | ^3.2.0 | 開発サーバー、バンドル、HMR |
| モジュール形式 | ES Modules | — | ネイティブブラウザモジュール |

### データソース（外部）

| データ種別 | 提供元 | 形式 | URL パターン |
|-----------|-------|------|-------------|
| 背景地図 | OpenStreetMap | ラスタータイル (PNG) | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` |
| 洪水浸水想定区域 | 国土地理院（GSI） | ラスタータイル (PNG) | `https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png` |
| 高潮浸水想定区域 | 国土地理院（GSI） | ラスタータイル (PNG) | `https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png` |
| 津波浸水想定区域 | 国土地理院（GSI） | ラスタータイル (PNG) | `https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png` |
| 土石流警戒区域 | 国土地理院（GSI） | ラスタータイル (PNG) | `https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/{z}/{x}/{y}.png` |
| 急傾斜警戒区域 | 国土地理院（GSI） | ラスタータイル (PNG) | `https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png` |
| 地滑り警戒区域 | 国土地理院（GSI） | ラスタータイル (PNG) | `https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png` |
| 指定緊急避難場所 | 国土地理院（GSI） | ベクトルタイル (PBF) | `{baseURL}/skhb/{z}/{x}/{y}.pbf`（ローカルホスト） |
| 標高タイル（地形） | 国土地理院（GSI） | raster-dem | `maplibre-gl-gsi-terrain` プラグイン経由 |

### インフラ・ビルド

| 区分 | 技術 | 役割 |
|------|------|------|
| PWA | Service Worker + manifest.json | オフライン対応・ホーム画面インストール |
| ベクトルタイル生成 | Tippecanoe v2.9.1 | `public/skhb/*.pbf` の事前生成 |
| デプロイ形式 | 静的ファイル（`dist/`） | CDN・静的ホスティングサービスへのデプロイ |

---

## プロジェクト構造

```
03_advanced_with_tsumiki/
├── main.js                  # アプリケーション全体（単一ファイル、603行）
├── index.html               # エントリーポイント HTML
├── style.css                # グローバルスタイル（未使用、空ファイル）
├── package.json             # 依存関係・ビルドスクリプト
├── public/
│   ├── manifest.json        # PWA マニフェスト
│   ├── sw.js                # Service Worker（最小実装）
│   ├── icon192.png          # PWA アイコン群
│   ├── icon256.png
│   ├── icon384.png
│   ├── icon512.png
│   └── skhb/                # 指定緊急避難場所ベクトルタイル（事前生成）
│       ├── metadata.json    # タイルメタデータ（Tippecanoe生成）
│       └── {z}/{x}/{y}.pbf  # ズームレベル5〜8のタイルデータ
└── dist/                    # ビルド出力（Vite生成）
    ├── index.html
    ├── assets/
    │   ├── index.*.css
    │   └── index.*.js
    └── skhb/                # ビルド時にコピーされるベクトルタイル
```

---

## アーキテクチャの特徴

### 1. クライアントサイドオンリー構成

```
ブラウザ
  └── main.js（SPA）
        ├── MapLibre GL JS（WebGLレンダリング）
        ├── 外部タイルサーバー群（CDN）への HTTP リクエスト
        │     ├── OSM ラスタータイル
        │     ├── GSI ハザードマップタイル
        │     └── GSI 標高タイル
        └── ローカルベクトルタイル（/skhb/）
              └── 指定緊急避難場所データ（PBF）
```

バックエンドAPIは存在せず、すべてのデータ取得はブラウザから直接外部サーバーへのHTTPリクエストで行う。

### 2. イベント駆動型の設計

```
map.on('load')    → コントロール・インタラクション初期化
map.on('render')  → 毎フレーム: ルートラインの更新
map.on('click')   → 避難場所クリック: ポップアップ表示
map.on('mousemove') → ホバー検出: カーソル変更
geolocationControl.on('geolocate') → 位置情報更新
```

### 3. 状態管理

アプリケーションの状態はシンプルなモジュールスコープ変数で管理:

```javascript
let userLocation = null;  // ユーザー現在地 [lng, lat] または null
```

Redux 等の状態管理ライブラリは使用せず、MapLibre GL JS のスタイル状態（レイヤーの visibility）を真実の源（Source of Truth）として活用。

### 4. ベクトルタイルの活用

全国112,525件の施設データを事前にベクトルタイル（PBF）に変換して配信。クライアントサイドフィルタリング（MapLibre GL JS の `filter` 式）で8種類の災害種別を効率的に切り替える。

---

## 非機能要件の実装状況

### セキュリティ

| 項目 | 状態 | 詳細 |
|------|------|------|
| 認証・認可 | 未実装 | 認証不要の公開情報のみを扱う |
| CORS | 外部依存 | 各タイルサーバーのCORS設定に依存 |
| XSS | 一部リスク | `main.js:480-512` でポップアップにHTML文字列を直接生成（外部入力ではなくベクトルタイル属性値のため低リスクだが要注意） |
| HTTPS | 外部依存 | ホスティング環境に依存 |

### パフォーマンス

| 項目 | 実装 |
|------|------|
| WebGLレンダリング | MapLibre GL JS により GPU アクセラレーション |
| ベクトルタイル | ズームレベル5〜8に最適化済み（Tippecanoe） |
| 遅延読み込み | タイルは表示領域・ズームに応じてオンデマンド取得 |
| オフラインキャッシュ | Service Worker 実装済み（ただし fetch ハンドリングは最小限） |

### 運用・監視

| 項目 | 状態 |
|------|------|
| ログ出力 | 未実装（console.log等なし） |
| エラートラッキング | 未実装 |
| テスト | 未実装（テストファイルなし） |
| CI/CD | 未設定 |
