# nuxt-migration データフロー図

**作成日**: 2026-04-20
**関連アーキテクチャ**: [architecture.md](architecture.md)
**関連要件定義**: [requirements.md](../../spec/nuxt-migration/requirements.md)

**【信頼性レベル凡例】**:
- 🔵 **青信号**: EARS要件定義書・設計文書・ユーザヒアリングを参考にした確実なフロー
- 🟡 **黄信号**: EARS要件定義書・設計文書・ユーザヒアリングから妥当な推測によるフロー
- 🔴 **赤信号**: EARS要件定義書・設計文書・ユーザヒアリングにない推測によるフロー

---

## 1. アプリ起動・初期化フロー 🔵

**信頼性**: 🔵 *REQ-001, REQ-002, REQ-010 + アーキテクチャ設計より*

```mermaid
sequenceDiagram
    participant Browser as ブラウザ
    participant Nuxt as Nuxt 3 CSR
    participant MC as MapContainer.vue
    participant useMap as useMap
    participant Composables as 各composables

    Browser->>Nuxt: ページアクセス（CSR）
    Nuxt->>Browser: index.html（空のSPAシェル）
    Browser->>Nuxt: JS/CSSバンドルを取得
    Nuxt->>MC: pages/index.vue → MapContainer.vue をレンダリング
    MC->>useMap: onMounted → useMap('map-container') 呼び出し
    useMap->>Browser: new maplibregl.Map({ container, ... }) 初期化
    Browser-->>useMap: map インスタンス
    useMap-->>MC: Ref<Map> を返す
    MC->>Composables: map.on('load') 後に各composable初期化
    Composables->>Browser: レイヤー・コントロール追加完了
```

---

## 2. ハザードマップ表示フロー 🔵

**信頼性**: 🔵 *REQ-020, REQ-021 + 既存実装 main.js:35-174より*

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant OpCtrl as OpacityControl（maplibre-gl-opacity）
    participant Map as MapLibre GL JS
    participant GSI as GSI ハザードタイルサーバー

    User->>OpCtrl: ハザードマップのスライダー/チェックボックス操作
    OpCtrl->>Map: setLayoutProperty('hazard_flood-layer', 'visibility', 'visible')
    OpCtrl->>Map: setPaintProperty('hazard_flood-layer', 'raster-opacity', 0.7)
    Map->>GSI: GET https://disaportaldata.gsi.go.jp/raster/.../z/x/y.png
    GSI-->>Map: PNG タイル
    Map-->>User: ハザードマップをオーバーレイ表示
```

**composable内の処理**:
```typescript
// useHazardLayers.ts 内の処理フロー
map.on('load', () => {
  // 1. ソース追加（6種）
  // 2. レイヤー追加（デフォルト visibility: 'none'）
  // 3. OpacityControl追加（position: 'top-left'）
})
```

---

## 3. 避難場所表示フロー 🔵

**信頼性**: 🔵 *REQ-030, REQ-031 + 既存実装 main.js:102-363より*

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant OpCtrl as OpacityControl（baseLayers排他）
    participant Map as MapLibre GL JS
    participant PBF as ローカルPBFタイル（/skhb/）

    User->>OpCtrl: 避難場所種別（例: 地震）を選択
    OpCtrl->>Map: 他種別を非表示（visibility: none）
    OpCtrl->>Map: 選択種別のみ表示（visibility: visible）
    Map->>PBF: GET /skhb/{z}/{x}/{y}.pbf
    PBF-->>Map: ベクトルタイルデータ
    Map->>Map: フィルター式（['get', 'disaster4']）を適用
    Map-->>User: 地震対応避難場所のサークルをレンダリング
```

**getCurrentLayerFilter() の動作**:
```typescript
// useShelterLayers.ts内
function getCurrentLayerFilter(): FilterExpression | null {
  const visibleLayer = SKHB_LAYER_IDS.find(
    id => map.value?.getLayoutProperty(id, 'visibility') === 'visible'
  )
  if (!visibleLayer) return null
  const disasterNum = visibleLayer.match(/skhb-(\d+)-layer/)?.[1]
  return disasterNum ? ['get', `disaster${disasterNum}`] : null
}
```

---

## 4. 避難場所クリック → ポップアップ表示フロー（XSS修正済み） 🔵

**信頼性**: 🔵 *REQ-060, NFR-101 + ユーザーヒアリング（createApp方式）より*

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Map as MapLibre GL JS
    participant Handler as click イベントハンドラ
    participant VueApp as createApp(ShelterPopup)
    participant Popup as maplibregl.Popup

    User->>Map: 避難場所アイコンをクリック
    Map->>Handler: map.on('click', LAYER_IDS, event)
    Handler->>Handler: features[0] を取得（SkhbProperties型）
    Handler->>Popup: new Popup().setLngLat(lngLat).addTo(map)
    Handler->>VueApp: createApp(ShelterPopup, { properties })
    VueApp->>Popup: app.mount(container) → setDOMContent(container)
    Popup-->>User: 施設名・住所・備考・対応災害種別を安全に表示
    User->>Popup: ポップアップを閉じる
    Popup->>VueApp: popup.on('close') → app.unmount()
```

**ShelterPopup.vue のテンプレート概要**:
```html
<!-- XSSリスクなし: {{ }} バインディングのみ使用 -->
<template>
  <div class="shelter-popup">
    <h3>{{ properties.name }}</h3>
    <p>{{ properties.address }}</p>
    <p v-if="properties.remarks">{{ properties.remarks }}</p>
    <ul>
      <li v-for="i in 8" :key="i"
          :class="{ disabled: !properties[`disaster${i}`] }">
        {{ DISASTER_LABELS[i] }}
      </li>
    </ul>
  </div>
</template>
```

---

## 5. 位置情報取得 → ルート描画フロー（EDGE-101バグ修正済み） 🔵

**信頼性**: 🔵 *REQ-040, REQ-050, REQ-051, REQ-052 + ユーザーヒアリング（EDGE-101修正）より*

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant GeoCtrl as GeolocateControl
    participant GeoAPI as Geolocation API（ブラウザ）
    participant useGeo as useGeolocation
    participant useRoute as useRoute
    participant Turf as @turf/distance
    participant Map as MapLibre GL JS

    User->>GeoCtrl: 位置情報ボタンをクリック
    GeoCtrl->>GeoAPI: getCurrentPosition() / watchPosition()
    GeoAPI-->>GeoCtrl: { coords: { longitude, latitude } }
    GeoCtrl-->>useGeo: geolocate イベント
    useGeo->>useGeo: userLocation.value = [lng, lat]

    loop map.on('render') 毎フレーム
        useRoute->>useRoute: ズーム < 7 または userLocation === null?
        alt 条件未満
            useRoute->>Map: route-source をクリア
        else 条件満足
            useRoute->>Map: querySourceFeatures('skhb', { filter })
            Map-->>useRoute: フィーチャー配列

            note over useRoute: EDGE-101修正: nullチェック
            useRoute->>Turf: distance() で最近傍施設を reduce()
            Turf-->>useRoute: nearestFeature（またはnull）

            alt nearestFeature === null
                useRoute->>Map: route-source をクリア（エラーなし）
            else nearestFeature 存在
                useRoute->>Map: route-source を LineString に更新
                Map-->>User: 青色ルートライン（#33aaff, 4px）を描画
            end
        end
    end
```

**EDGE-101修正のコード**:
```typescript
// useRoute.ts 内
map.on('render', () => {
  if (map.getZoom() < 7 || !userLocation.value) {
    clearRoute()
    return
  }
  const features = map.querySourceFeatures('skhb', { filter: getCurrentLayerFilter() })
  const nearestFeature = getNearestFeature(userLocation.value, features)

  // ← EDGE-101修正: null チェック追加
  if (!nearestFeature) {
    clearRoute()
    return
  }

  drawRoute(userLocation.value, nearestFeature.geometry.coordinates)
})
```

---

## 6. 位置情報追跡停止フロー 🔵

**信頼性**: 🔵 *REQ-040, REQ-102（元REQ-102）+ 既存実装 main.js:545-546より*

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant GeoCtrl as GeolocateControl
    participant useGeo as useGeolocation
    participant useRoute as useRoute
    participant Map as MapLibre GL JS

    User->>GeoCtrl: 位置情報ボタンを再クリック（追跡停止）
    GeoCtrl-->>useGeo: trackend または _watchState === 'OFF'
    useGeo->>useGeo: userLocation.value = null
    useRoute->>useRoute: 次のrenderイベントでuserLocation === null を検出
    useRoute->>Map: route-source をクリア
    Map-->>User: ルートラインを消去
```

---

## 7. 3D地形表示フロー 🔵

**信頼性**: 🔵 *REQ-070 + 既存実装 main.js:580-602より*

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant TerrainCtrl as TerrainControl
    participant Map as MapLibre GL JS
    participant GSITerrain as GSI 標高タイルサーバー

    note over Map: useTerrain() → map.on('load') 後に実行
    Map->>Map: useGsiTerrainSource() で raster-dem ソース追加
    Map->>Map: hillshade レイヤー追加（exaggeration: 0.2）
    Map->>Map: TerrainControl を追加

    User->>TerrainCtrl: 3Dトグルボタンをクリック
    TerrainCtrl->>Map: setTerrain({ source: 'gsi-terrain', exaggeration: 1.5 })
    Map->>GSITerrain: GET 標高タイル
    GSITerrain-->>Map: raster-dem タイル
    Map-->>User: WebGL 3Dレンダリングで地形を立体表示
```

---

## 8. カーソル変更フロー 🔵

**信頼性**: 🔵 *REQ-061 + 既存実装 main.js:519-540より*

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Map as MapLibre GL JS
    participant Handler as mousemove ハンドラ

    User->>Map: 地図上でマウス移動
    Map->>Handler: map.on('mousemove', event)
    Handler->>Map: queryRenderedFeatures(point, { layers: SKHB_LAYER_IDS })
    alt 避難場所アイコン上
        Handler->>Map: canvas.style.cursor = 'pointer'
    else 通常エリア
        Handler->>Map: canvas.style.cursor = ''
    end
```

---

## 9. アプリ終了・クリーンアップフロー 🔵

**信頼性**: 🔵 *EDGE-202 + Vue 3 composablesのベストプラクティスより*

```mermaid
sequenceDiagram
    participant Vue as Vue 3
    participant MC as MapContainer.vue
    participant useMap as useMap

    Vue->>MC: onUnmounted 呼び出し
    MC->>useMap: onUnmounted フック実行
    useMap->>useMap: map.value?.remove()
    useMap->>useMap: map.value = null
    note over useMap: WebGLコンテキスト・タイルキャッシュ解放
```

---

## データ処理パターン

### 同期処理 🔵

**信頼性**: 🔵 *アーキテクチャ設計より*

- マップ初期化（`new maplibregl.Map()`）
- レイヤー追加・設定変更
- ポップアップ表示

### 非同期処理（タイル取得） 🔵

**信頼性**: 🔵 *MapLibre GL JS の内部動作より*

- タイルの取得はMapLibre GL JSが内部で非同期管理（開発者が意識する必要なし）
- `map.on('load')` で全レイヤーの初期化完了を検出

### 毎フレーム処理 🔵

**信頼性**: 🔵 *REQ-050 + 既存実装 main.js:542-577より*

- `map.on('render')` でルート計算を毎フレーム実行
- 軽量に保つため `querySourceFeatures` の結果を最小限に絞る（filter適用）

---

## 状態管理フロー

### Vueリアクティブ状態 🔵

**信頼性**: 🔵 *ユーザーヒアリング + Vue 3 Composition APIより*

```mermaid
stateDiagram-v2
    [*] --> 初期化中: MapContainer.vue マウント
    初期化中 --> マップ表示: map.on('load') 発火
    マップ表示 --> レイヤー制御中: OpacityControl操作
    マップ表示 --> 位置情報追跡中: GeolocateControl ON
    位置情報追跡中 --> ルート表示中: zoom >= 7 かつ 避難場所表示
    ルート表示中 --> ルート非表示: zoom < 7 または 追跡停止
    位置情報追跡中 --> マップ表示: 追跡停止
    マップ表示 --> [*]: コンポーネントアンマウント
```

### 状態変数一覧 🔵

**信頼性**: 🔵 *要件定義 + 既存実装の状態管理パターンより*

| 変数 | 型 | 管理場所 | 説明 |
|-----|-----|---------|------|
| `map` | `Ref<maplibregl.Map \| null>` | `useMap` | マップインスタンス |
| `userLocation` | `Ref<UserLocation>` | `useGeolocation` | 現在地座標（null=未取得） |
| レイヤーvisibility | MapLibre内部状態 | MapLibre GL JS | 各レイヤーの表示/非表示 |
| レイヤーopacity | MapLibre内部状態 | MapLibre GL JS | 各レイヤーの不透明度 |

**設計方針**: アプリケーション状態は最小限のVue Refと MapLibre GL JSの内部状態で管理。
Piniaは導入しない（シングルページアプリで不要なため）。

---

## 関連文書

- **アーキテクチャ**: [architecture.md](architecture.md)
- **型定義**: [interfaces.ts](interfaces.ts)
- **要件定義**: [requirements.md](../../spec/nuxt-migration/requirements.md)
- **移行元データフロー**: [../disaster-prevention-map/dataflow.md](../disaster-prevention-map/dataflow.md)

---

## 信頼性レベルサマリー

- 🔵 青信号: 9件 (100%)
- 🟡 黄信号: 0件 (0%)
- 🔴 赤信号: 0件 (0%)

**品質評価**: ✅ 高品質
