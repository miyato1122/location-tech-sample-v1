# 防災マップ テストケース一覧（逆生成）

## テストケース概要

| ID | テスト名 | カテゴリ | 優先度 | 実装状況 | 参照実装 | 推定工数 |
|----|---------|---------|-------|---------|---------|---------|
| TC-001 | 最近傍施設の正確な特定 | Unit | 高 | ❌ | `main.js:387-413` | 2h |
| TC-002 | 最近傍計算: フィーチャー0件時のnull返却 | Unit | 高 | ❌ | `main.js:396-410` | 1h |
| TC-003 | 最近傍計算: 単一フィーチャーの返却 | Unit | 高 | ❌ | `main.js:396-410` | 1h |
| TC-004 | 最近傍計算: 複数フィーチャーから最近傍を選択 | Unit | 高 | ❌ | `main.js:396-410` | 2h |
| TC-005 | 表示中レイヤーフィルター取得 | Unit | 高 | ❌ | `main.js:371-382` | 1h |
| TC-006 | ルートライン生成: GeoJSON形式の確認 | Unit | 中 | ❌ | `main.js:561-576` | 1h |
| TC-007 | ズームレベル閾値 < 7 でルートクリア | Unit | 高 | ❌ | `main.js:548-554` | 1h |
| TC-008 | GeolocateControl OFF時のuserLocation初期化 | Unit | 高 | ❌ | `main.js:545-546` | 1h |
| TC-009 | マップ初期化: 中心座標・ズーム設定 | Integration | 中 | ❌ | `main.js:15-21` | 2h |
| TC-010 | マップ初期化: 表示可能範囲制限 | Integration | 中 | ❌ | `main.js:21` | 1h |
| TC-011 | ハザードレイヤーのデフォルト非表示 | Integration | 中 | ❌ | `main.js:133-174` | 1h |
| TC-012 | 避難場所レイヤーのデフォルト非表示 | Integration | 中 | ❌ | `main.js:187-363` | 1h |
| TC-013 | skhbレイヤー 災害種別フィルター動作 | Integration | 高 | ❌ | `main.js:207,229,...` | 2h |
| TC-014 | ポップアップ: 施設情報の表示 | Integration | 中 | ❌ | `main.js:476-515` | 2h |
| TC-015 | ポップアップ: remarks が null の場合の表示 | Integration | 高 | ❌ | `main.js:485` | 1h |
| TC-016 | ポップアップ: disaster フラグによる色分け | Integration | 中 | ❌ | `main.js:487-511` | 2h |
| TC-017 | ポップアップ: 複数フィーチャー重複時は先頭を表示 | Integration | 低 | ❌ | `main.js:475` | 1h |
| TC-018 | 地図クリック: 避難場所なし時はポップアップ非表示 | Integration | 中 | ❌ | `main.js:472` | 1h |
| TC-019 | カーソル: 避難場所ホバー時にpointerに変更 | Integration | 低 | ❌ | `main.js:534-535` | 1h |
| TC-020 | カーソル: 避難場所外でデフォルトに戻る | Integration | 低 | ❌ | `main.js:537` | 1h |
| TC-021 | 地図初期表示フロー（E2E） | E2E | 高 | ❌ | `main.js:15-366` | 3h |
| TC-022 | ハザードマップ表示切り替えフロー（E2E） | E2E | 高 | ❌ | `main.js:430-440` | 2h |
| TC-023 | 避難場所種別切り替えフロー（E2E） | E2E | 高 | ❌ | `main.js:443-455` | 2h |
| TC-024 | 避難場所クリック〜ポップアップ表示フロー（E2E） | E2E | 高 | ❌ | `main.js:458-516` | 3h |
| TC-025 | 位置情報取得〜ルート表示フロー（E2E） | E2E | 高 | ❌ | `main.js:418-577` | 4h |
| TC-026 | ズームレベル変化によるルート表示/非表示（E2E） | E2E | 中 | ❌ | `main.js:548` | 2h |
| TC-027 | 3D地形ON/OFFフロー（E2E） | E2E | 低 | ❌ | `main.js:597-602` | 2h |
| TC-028 | PWAマニフェスト: メタデータの正確性 | E2E | 低 | ❌ | `public/manifest.json` | 1h |
| TC-029 | 最近傍計算の速度: 1000件フィーチャー（性能） | Performance | 中 | ❌ | `main.js:396-410` | 2h |
| TC-030 | renderループ: フレームレートへの影響（性能） | Performance | 中 | ❌ | `main.js:542-577` | 3h |
| TC-031 | ポップアップHTML: XSS対策の確認（セキュリティ） | Security | 中 | ❌ | `main.js:480-512` | 2h |
| TC-032 | 表示範囲外への移動制限（境界値） | Integration | 中 | ❌ | `main.js:21` | 1h |

**推定総工数**: 約55時間

---

## 詳細テストケース

---

### TC-001: 最近傍施設の正確な特定

**テスト目的**: 複数の避難場所フィーチャーが存在するとき、ユーザー現在地から最も近い施設が正確に返されることを検証する

**カテゴリ**: Unit  
**優先度**: 高  
**参照実装**: `main.js:387-413`

**事前条件**:
- `@turf/distance` が正しくインポートされている
- テスト用フィーチャー配列が用意されている

**テストデータ**:
```javascript
const mockFeatures = [
    { geometry: { coordinates: [139.0, 35.0] }, properties: { name: '施設A', dist: undefined } },
    { geometry: { coordinates: [139.1, 35.1] }, properties: { name: '施設B', dist: undefined } },
    { geometry: { coordinates: [139.5, 35.5] }, properties: { name: '施設C', dist: undefined } },
];
// ユーザー位置: [139.0, 35.0] に最も近いのは施設A
const userLocation = [139.01, 35.01];
```

**期待結果**:
- `getNearestFeature(139.01, 35.01)` が施設Aのフィーチャーを返す
- 返却フィーチャーの `properties.dist` に距離（km）が付加されている

**実装ファイル**: `tests/unit/getNearestFeature.test.js`

---

### TC-002: 最近傍計算: フィーチャー0件時のnull返却

**テスト目的**: 表示中の避難場所がゼロ件のとき、`getNearestFeature()` が `null` を返し、後続の `main.js:568` でTypeErrorが発生することを確認する（バグの再現テスト）

**カテゴリ**: Unit  
**優先度**: 高（既知のバグリスク）  
**参照実装**: `main.js:396-410`, `main.js:568`

**テストデータ**:
```javascript
// querySourceFeatures が空配列を返す状況
mockMap.querySourceFeatures.mockReturnValue([]);
```

**期待結果（現状のバグ確認）**:
- `getNearestFeature()` は `null` を返す
- 呼び出し元で `nearestFeature._geometry.coordinates` を参照すると TypeError が発生する

**修正後の期待結果**:
- `nearestFeature` が `null` の場合、ルート更新処理をスキップする
- エラーが発生しない

**実装ファイル**: `tests/unit/getNearestFeature.test.js`

---

### TC-005: 表示中レイヤーフィルター取得

**テスト目的**: `getCurrentSkhbLayerFilter()` が現在 `visibility: 'visible'` のskhbレイヤーのfilter条件を正しく返すことを検証する

**カテゴリ**: Unit  
**優先度**: 高  
**参照実装**: `main.js:371-382`

**テストデータ**:
```javascript
// skhb-4-layer（地震）が visible の状態
mockMap.getStyle.mockReturnValue({
    layers: [
        { id: 'skhb-1-layer', layout: { visibility: 'none' }, filter: ['get', 'disaster1'] },
        { id: 'skhb-2-layer', layout: { visibility: 'none' }, filter: ['get', 'disaster2'] },
        { id: 'skhb-4-layer', layout: { visibility: 'visible' }, filter: ['get', 'disaster4'] },
        // ...他のskhbレイヤー
    ],
});
```

**期待結果**:
- `getCurrentSkhbLayerFilter()` が `['get', 'disaster4']` を返す

**実装ファイル**: `tests/unit/getCurrentSkhbLayerFilter.test.js`

---

### TC-007: ズームレベル閾値 < 7 でルートクリア

**テスト目的**: ズームレベルが7未満のとき、ルートの GeoJSON データが空配列でリセットされることを検証する

**カテゴリ**: Unit  
**優先度**: 高  
**参照実装**: `main.js:548-554`

**テストデータ**:
```javascript
mockMap.getZoom.mockReturnValue(6); // ズーム6（閾値未満）
userLocation = [139.0, 35.0]; // 位置情報あり
```

**期待結果**:
- `route` ソースの `setData` が `{ type: 'FeatureCollection', features: [] }` で呼ばれる
- ルートラインが非表示になる

**境界値**:

| ズームレベル | 期待動作 |
|------------|---------|
| 6 | ルートクリア（閾値未満） |
| 7 | ルート表示（閾値以上） |
| 8 | ルート表示 |

**実装ファイル**: `tests/unit/routeRendering.test.js`

---

### TC-015: ポップアップ: remarks が null の場合の表示

**テスト目的**: 避難場所フィーチャーの `remarks` 属性が `null` のとき、ポップアップにエラーなく表示されることを検証する

**カテゴリ**: Integration  
**優先度**: 高  
**参照実装**: `main.js:485` — `feature.properties.remarks ?? ''`

**テストデータ**:
```javascript
const feature = {
    geometry: { coordinates: [139.0, 35.0] },
    properties: {
        name: 'テスト避難所',
        address: '東京都千代田区1-1',
        remarks: null,  // ← nullの場合
        disaster1: true,
        disaster2: false,
        // ...
    }
};
```

**期待結果**:
- ポップアップが表示される（エラーなし）
- remarks のセクションが空文字として表示される
- 他の情報（name, address）は正常に表示される

**実装ファイル**: `tests/integration/popup.test.js`

---

### TC-025: 位置情報取得〜ルート表示フロー（E2E）

**テスト目的**: ユーザーが位置情報を許可し、ズームレベルが7以上のとき、最寄り避難場所へのルートラインが地図上に描画されることをE2Eで検証する

**カテゴリ**: E2E  
**優先度**: 高  
**参照実装**: `main.js:418-577`

**前提条件**:
- ブラウザの Geolocation API をモック（Playwright の `page.setGeolocation()`）
- 避難場所レイヤーがひとつ表示状態である

**テスト手順**:
```javascript
// Playwright
test('位置情報取得後にルートが表示される', async ({ page, context }) => {
    // 位置情報をモック（東京駅付近）
    await context.setGeolocation({ latitude: 35.6812, longitude: 139.7671 });
    await context.grantPermissions(['geolocation']);

    await page.goto('./');

    // 避難場所レイヤー（地震）を表示
    await page.click('text=地震');  // OpacityControl の地震ラベル

    // 位置情報ボタンをクリック
    await page.click('.maplibregl-ctrl-geolocate');

    // ズームレベルを7以上に設定
    // ...

    // ルートラインが表示されることを確認
    const routeLayer = await page.evaluate(() =>
        window.map.getSource('route').serialize().data.features.length
    );
    expect(routeLayer).toBe(1);
});
```

**期待結果**:
- 位置情報取得後、最寄り施設まで青色の直線が描画される
- ズームレベルを7未満にするとラインが消える
- 位置情報をOFFにするとラインが消える

**実装ファイル**: `tests/e2e/geolocation-routing.spec.js`

---

### TC-031: ポップアップHTML: XSSの確認

**テスト目的**: ベクトルタイルの属性値（name, address, remarks）にスクリプトタグが含まれていた場合、ポップアップで実行されないことを検証する

**カテゴリ**: Security  
**優先度**: 中  
**参照実装**: `main.js:480-512`

**テストデータ**:
```javascript
const maliciousFeature = {
    geometry: { coordinates: [139.0, 35.0] },
    properties: {
        name: '<script>alert("XSS")</script>テスト避難所',
        address: '<img src=x onerror=alert(1)>東京都',
        remarks: null,
        disaster1: true,
    }
};
```

**期待結果**:
- ポップアップ内でスクリプトが実行されない
- アラートダイアログが表示されない
- テキストとしてタグ文字列が表示される（またはサニタイズされる）

**注意**: 現実装（`setHTML` で文字列テンプレートリテラルを直接渡す）はXSSリスクがある。`textContent` を用いた安全な実装への変更を推奨する。

**実装ファイル**: `tests/security/popup-xss.spec.js`
