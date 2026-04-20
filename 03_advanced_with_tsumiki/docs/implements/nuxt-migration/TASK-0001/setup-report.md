# TASK-0001 設定作業実行

## 作業概要

- **タスクID**: TASK-0001
- **作業内容**: Nuxt 4プロジェクト初期化・依存パッケージ設定
- **実行日時**: 2026-04-20
- **実行者**: Claude Code

## 設計文書参照

- **参照文書**: docs/tasks/nuxt-migration/TASK-0001.md, docs/design/nuxt-migration/architecture.md
- **関連要件**: REQ-001, REQ-002, REQ-003

## 実行した作業

### 1. Nuxt プロジェクト作成

```bash
npx nuxi@latest init nuxt-map-app --template minimal --no-install --gitInit=false
```

**備考**: nuxi@latest は Nuxt 4 (^4.4.2) をインストール。設計書は Nuxt 3 を想定していたが、
Nuxt 4 は Nuxt 3 との後方互換性を維持しており、composables・pages・componentsの構成は同様。
ディレクトリ構造は Nuxt 4 の `app/` 配下に配置される（`app/pages/`, `app/composables/` 等）。

### 2. nuxt.config.ts 設定

**作成ファイル**: `nuxt-map-app/nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  ssr: false,          // MapLibre GL JS のSSR問題を回避（REQ-002）
  modules: ['@vite-pwa/nuxt'],
  pwa: { ... },        // PWA設定（manifest + workbox）
  typescript: { strict: true },
})
```

### 3. 依存パッケージのインストール

```bash
npm install maplibre-gl @turf/distance maplibre-gl-opacity maplibre-gl-gsi-terrain
npm install -D @vite-pwa/nuxt
npm install -D @nuxt/test-utils vitest @playwright/test
```

**インストール済みバージョン（注意: 既存プロジェクトより新しいバージョン）**:

| パッケージ | 既存 | インストール済み |
|-----------|------|----------------|
| maplibre-gl | ^2.4.0 | ^5.23.0 |
| @turf/distance | ^6.5.0 | ^7.3.4 |
| maplibre-gl-opacity | ^1.4.0 | ^1.8.0 |
| maplibre-gl-gsi-terrain | ^0.0.2 | ^2.3.2 |

> **注意**: メジャーバージョンが上がっているため、TASK-0006以降のcomposables実装時にAPIの差異を確認・対応が必要。

### 4. ディレクトリ構造作成

```bash
mkdir -p app/pages app/components app/composables types tests/unit tests/e2e
```

### 5. app/app.vue 更新

`NuxtWelcome` → `NuxtPage` に変更（ページルーティング対応）

## 作業結果

- [x] Nuxt 4プロジェクト作成完了（nuxt-map-app/）
- [x] nuxt.config.ts に ssr: false 設定完了
- [x] 必要な npm パッケージのインストール完了
- [x] TypeScript strict: true 設定完了
- [x] ディレクトリ構造（app/pages, app/components, app/composables, types, tests）作成完了
- [x] app/app.vue を NuxtPage 対応に更新

## 遭遇した問題と解決方法

### 問題1: nuxi init の対話形式

- **発生状況**: `nuxi@latest init` がテンプレート選択・パッケージマネージャー選択を要求
- **解決方法**: `--template minimal` オプションで minimal テンプレートを指定し、npm を選択

### 問題2: Nuxt 4 がインストールされた

- **発生状況**: `nuxi@latest` が Nuxt 4 (^4.4.2) を作成した
- **対応方針**: Nuxt 4 は Nuxt 3 との互換性を維持。ディレクトリ構造は `app/` 配下となるが、
  composables・pages等の機能は同様に使用可能。後続タスクのパスは `app/composables/` 等に読み替える。

## 次のステップ

- `/tsumiki:direct-verify` を実行して設定を確認
- TASK-0002: TypeScript型定義ファイル作成（types/index.ts）
