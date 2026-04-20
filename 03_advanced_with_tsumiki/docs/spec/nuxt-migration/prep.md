# nuxt-migration 準備タスク（ユーザー作業）

> **仕様**: [requirements.md](requirements.md)
> **生成日**: 2026-04-20

**【信頼性レベル凡例】**:
- 🔵 **青信号**: 要件定義書・設計文書・ユーザヒアリングで明確に必要と判明したタスク
- 🟡 **黄信号**: 要件定義書・設計文書から妥当に推測されるタスク
- 🔴 **赤信号**: 推測による予防的タスク（実装時に不要と判明する可能性あり）

---

## 必須（実装開始前に完了が必要）

以下のタスクが完了していないと、実装フェーズでブロッカーになります。

- [ ] **Node.js 18以上のインストール確認** 🔵 *Nuxt 3の動作要件より*
  - `node -v` で v18.x 以上を確認する
  - 必要に応じて [https://nodejs.org](https://nodejs.org) からインストール
  - 関連要件: REQ-001

- [ ] **npmパッケージのバージョン確認** 🔵 *移行時の互換性確認より*
  - `maplibre-gl-opacity` が MapLibre GL JS ^2.x と互換性があることを確認
  - `maplibre-gl-gsi-terrain` が Nuxt 3 + Vite 4.x 環境で動作することを確認
  - 関連要件: REQ-001, REQ-020, REQ-070

---

## 推奨（実装中に用意できればOK）

実装を開始できますが、該当機能の実装前までに準備してください。

- [ ] **ベクトルタイルデータの移動準備** 🔵 *既存実装より*
  - 既存の `public/skhb/` ディレクトリ（PBFファイル群）を新Nuxt 3プロジェクトの `public/skhb/` にコピーする計画を立てる
  - `public/skhb/metadata.json` も含める
  - 必要になるフェーズ: composables実装フェーズ（useShelterLayers）
  - 関連要件: REQ-030

- [ ] **PWAアイコンの準備** 🔵 *REQ-080より*
  - 既存アイコン（`public/icon192.png`, `icon256.png`, `icon384.png`, `icon512.png`）を新プロジェクトの `public/` にコピー
  - 必要になるフェーズ: PWA設定フェーズ
  - 関連要件: REQ-080

- [ ] **Playwright E2Eテスト用Geolocationモックの調査** 🟡 *REQ-090から妥当な推測*
  - PlaywrightのGeolocation APIモック機能（`context.setGeolocation`）を調査
  - テスト時に使用する仮の座標を決定（例: 東京都庁 `{longitude: 139.6917, latitude: 35.6895}`）
  - 必要になるフェーズ: テスト実装フェーズ
  - 関連要件: REQ-090

---

## 確認事項（判断が必要）

実装方針に影響するため、早めの判断・確認が推奨されます。

- [ ] **@vite-pwa/nuxtのキャッシュ戦略** 🟡 *REQ-080から妥当な推測*
  - ベクトルタイル（`/skhb/*.pbf`）をキャッシュするかどうかを判断
  - キャッシュする場合: タイルサイズが大きいため容量制限に注意
  - キャッシュしない場合: オフライン時に避難場所が表示されない
  - 推奨: NetworkFirstでベクトルタイルをキャッシュ（容量制限あり）
  - 関連要件: REQ-080, NFR-301

- [ ] **ポップアップのマウント方式の決定** 🟡 *REQ-060から妥当な推測*
  - MapLibre GL JSの `Popup.setDOMContent()` にVueコンポーネントをマウントする実装方式を事前調査
  - 選択肢:
    - `createApp(ShelterPopup, props).mount(container)` でVueアプリを直接マウント
    - Nuxt 3の `useNuxtApp().$mount` を利用
  - 関連要件: REQ-060

---

## サマリー

| 優先度 | 件数 | 🔵 | 🟡 | 🔴 |
|--------|------|-----|-----|-----|
| 必須 | 2件 | 2件 | 0件 | 0件 |
| 推奨 | 3件 | 2件 | 1件 | 0件 |
| 確認事項 | 2件 | 0件 | 2件 | 0件 |

---

## 関連文書

- **要件定義書**: [requirements.md](requirements.md)
- **ヒアリング記録**: [interview-record.md](interview-record.md)
