# nuxt-migration 設計ヒアリング記録

**作成日**: 2026-04-20
**ヒアリング実施**: step4 既存情報ベースの差分ヒアリング

## ヒアリング目的

既存の要件定義書・アーキテクチャ設計・実装（main.js）を確認し、
Nuxt 3移行の設計方針に関する不明点や設計選択を明確化するためのヒアリングを実施しました。

---

## 質問と回答

### Q1: 設計規模

**質問日時**: 2026-04-20
**カテゴリ**: スコープ確認
**背景**: フル設計（全ファイル）を作成するか、軽量版にするかを確認

**回答**: フル設計（推奨）

**信頼性への影響**:
- architecture.md / dataflow.md / interfaces.ts / design-interview.md の全ファイルを作成（🔵）

---

### Q2: 既存実装の詳細分析の要否

**質問日時**: 2026-04-20
**カテゴリ**: スコープ確認
**背景**: 逆生成済みの設計文書が揃っており、main.jsの詳細分析が必要かを確認

**回答**: 不要（設計文書のみで設計を作成）

**信頼性への影響**:
- 既存の逆生成ドキュメントが設計に十分な情報を提供していることを確認（🔵）

---

### Q3: Nuxt 3ディレクトリ構造

**質問日時**: 2026-04-20
**カテゴリ**: アーキテクチャ
**背景**: Nuxt 3標準構造（pages/components/composables/types/）とfeatures/ベース構造のどちらを採用するか。
シングルページのアプリのため、どちらでも機能するが保守性・学習コストが異なる

**回答**: Nuxt 3標準構造（推奨）
```
pages/ components/ composables/ types/ public/
```

**信頼性への影響**:
- ディレクトリ構造の設計が 🔴 → 🔵 に向上
- Nuxt 3の自動インポート機能が最大限活用できる

---

### Q4: composables間のマップインスタンス共有方法

**質問日時**: 2026-04-20
**カテゴリ**: アーキテクチャ
**背景**: 6つのcomposablesは全て `map` インスタンスを必要とする。
共有方法として: provide/inject・propsドリリング・Pinia の3択

**回答**: provide/injectパターン（推奨）

**信頼性への影響**:
- `MapContainer.vue` 内で `useMap()` を呼び、`map` Refを各composableの引数として渡す方式に確定（🔵）
- 実装上はpropsドリリング（引数渡し）と等価だが、`MapContainer.vue` を中心とした疎結合設計が確定

---

### Q5: ShelterPopupのVueコンポーネントマウント方式

**質問日時**: 2026-04-20
**カテゴリ**: 技術選択
**背景**: MapLibre GL JSのPopupにVueコンポーネントをマウントする方法として:
- `createApp(ShelterPopup).mount(container)` — シンプルで実績あり
- `<Teleport>` — Nuxt標準だが座標管理が複雑

**回答**: createAppで独立VueAppをマウント（推奨）

**信頼性への影響**:
- ShelterPopup.vueの実装方式が 🔴 → 🔵 に向上
- `popup.on('close')` で `app.unmount()` を呼ぶことによるメモリリーク防止が確定

---

### Q6: nuxt.config.ts の設定方針

**質問日時**: 2026-04-20
**カテゴリ**: 技術選択
**背景**: `maplibre-gl` の大容量バンドル最適化（worker設定等）が必要か確認

**回答**: 標準設定でOK（推奨）

**信頼性への影響**:
- `nuxt.config.ts` の設定内容が確定（🔵）
- `ssr: false`, `@vite-pwa/nuxt`, `typescript.strict: true` の標準設定で進める

---

### Q7: TypeScript型定義ファイルの分割方針

**質問日時**: 2026-04-20
**カテゴリ**: 技術選択
**背景**: 既存の `interfaces.ts` を機能別に分割するか、一括にまとめるか

**回答**: types/index.tsに一括定義（推奨）

**信頼性への影響**:
- 型定義の配置場所が 🔴 → 🔵 に向上
- 既存の `docs/design/disaster-prevention-map/interfaces.ts` を `types/index.ts` に移行・拡張する方針が確定

---

## ヒアリング結果サマリー

### 設計方針の決定事項

1. **ディレクトリ構造**: Nuxt 3標準（pages / components / composables / types / public）
2. **マップインスタンス共有**: `MapContainer.vue` から各composableへの引数渡し
3. **ShelterPopup**: `createApp(ShelterPopup, props).mount(container)` + `popup.on('close')` で `unmount()`
4. **nuxt.config.ts**: `ssr: false` + `@vite-pwa/nuxt` + `typescript.strict: true` の標準設定
5. **型定義**: `types/index.ts` に全型定義を一括配置
6. **Pinia不採用**: シングルページアプリのため、Vue Refとインジェクションで十分

### 残課題

- `maplibre-gl-opacity` の TypeScript型定義が不完全な可能性（`@types/` パッケージ未確認）
- `maplibre-gl-gsi-terrain` の型定義状況（同上）
- `createApp` で独立マウントしたVueアプリのNuxtプラグイン・provide/injectの継承問題
- `@vite-pwa/nuxt` のベクトルタイル（`/skhb/*.pbf`）のキャッシュ戦略の詳細

---

## 信頼性レベル分布

**ヒアリング前**:
- 🔵 青信号: 3件
- 🟡 黄信号: 4件
- 🔴 赤信号: 5件

**ヒアリング後**:
- 🔵 青信号: 11件 (+8)
- 🟡 黄信号: 1件 (-3)
- 🔴 赤信号: 0件 (-5)

---

## 関連文書

- **アーキテクチャ設計**: [architecture.md](architecture.md)
- **データフロー**: [dataflow.md](dataflow.md)
- **型定義**: [interfaces.ts](interfaces.ts)
- **要件定義**: [requirements.md](../../spec/nuxt-migration/requirements.md)
- **要件ヒアリング記録**: [requirements interview-record.md](../../spec/nuxt-migration/interview-record.md)
