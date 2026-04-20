# Requirements Document

## Introduction

本ドキュメントは、日本国内向けのハザードマップ・指定緊急避難場所可視化 Web アプリケーション（`hazard-map-app`）の要件を定義します。  
既存の実装（`main.js`）をリバースエンジニアリングして作成しており、地図表示・ハザードレイヤー切り替え・避難場所フィルタリング・最寄り避難場所ルート表示・3D 地形表示・PWA 対応の各機能を網羅します。

## Boundary Context

- **In scope**: 地図表示、ハザードマップオーバーレイ、指定緊急避難場所の表示・フィルタリング、最寄り避難場所へのルート表示、3D 地形表示、PWA（オフライン対応）
- **Out of scope**: ユーザー認証・アカウント管理、避難経路のルーティング計算（直線距離のみ対象）、リアルタイム災害情報の取得、バックエンド API
- **Adjacent expectations**: 地理院タイル・ハザードポータルなどの外部タイルサービスが正常稼働していること

---

## Requirements

### Requirement 1: ベース地図の表示

**Objective:** 利用者として、日本全国をカバーするベース地図を閲覧したい。地図上で位置を把握し、各種オーバーレイを重ねて表示できるようにするため。

#### Acceptance Criteria

1. The Hazard Map App shall 初期表示時に中心座標 [138, 37]・ズームレベル 5 で OpenStreetMap ラスタータイルをレンダリングする。
2. The Hazard Map App shall ズームレベルを 5〜18 の範囲に制限し、表示範囲を日本域（東経 122〜154°、北緯 20〜50°）に制限する。
3. When ユーザーがマウス操作またはタッチ操作で地図を操作する, the Hazard Map App shall パン・ズームに応じてタイルを再取得し、スムーズに表示を更新する。

---

### Requirement 2: ハザードマップオーバーレイの表示・切り替え

**Objective:** 利用者として、複数種類のハザードマップを地図に重ねて表示・非表示を切り替えたい。自宅や目的地周辺の災害リスクを視覚的に確認できるようにするため。

#### Acceptance Criteria

1. The Hazard Map App shall 以下 6 種類のハザードレイヤーをラスタータイルで提供する：洪水浸水想定区域・高潮浸水想定区域・津波浸水想定区域・土石流警戒区域・急傾斜警戒区域・地滑り警戒区域。
2. When アプリが初期ロードされる, the Hazard Map App shall すべてのハザードレイヤーを非表示状態（`visibility: none`）で初期化する。
3. When ユーザーが OpacityControl パネルでレイヤーを選択する, the Hazard Map App shall 該当レイヤーの `visibility` を `visible` に切り替えて地図上に重ねて表示する。
4. While ハザードレイヤーが表示中である, the Hazard Map App shall 不透明度 0.7 でラスタータイルを描画し、ベース地図が透けて見えるようにする。
5. The Hazard Map App shall 画面左上に OpacityControl パネルを配置し、各レイヤーの表示・非表示を独立して切り替えられるようにする。

---

### Requirement 3: 指定緊急避難場所の表示・フィルタリング

**Objective:** 利用者として、災害種別ごとに対応した指定緊急避難場所を地図上で確認したい。自分が直面している災害に適した避難場所を素早く特定できるようにするため。

#### Acceptance Criteria

1. The Hazard Map App shall 国土地理院の指定緊急避難場所データをベクトルタイル（`skhb/{z}/{x}/{y}.pbf`）として読み込み、円形マーカーで表示する。
2. The Hazard Map App shall 災害種別（洪水・崖崩れ/土石流/地滑り・高潮・地震・津波・大規模な火事・内水氾濫・火山現象）に対応する 8 種類のフィルタリングレイヤーを提供する。
3. When アプリが初期ロードされる, the Hazard Map App shall すべての避難場所レイヤーを非表示状態で初期化する。
4. When ユーザーが画面右上の OpacityControl パネルで災害種別を選択する, the Hazard Map App shall 対応する属性（`disaster1`〜`disaster8`）が `true` の避難場所のみを表示する。
5. When ユーザーが避難場所マーカーをクリックする, the Hazard Map App shall 施設名・住所・備考・対応災害種別（対応外は灰色）を含むポップアップを表示する。
6. When ユーザーのカーソルが避難場所マーカー上に移動する, the Hazard Map App shall カーソルを `pointer` に変更する。
7. The Hazard Map App shall ズームレベルに応じてマーカーのサイズを補間し（ズーム 5 で半径 2px、ズーム 14 で 6px）、視認性を確保する。

---

### Requirement 4: 現在地取得と最寄り避難場所へのルート表示

**Objective:** 利用者として、自分の現在地から最寄りの避難場所までのルートを地図上で確認したい。迅速に避難場所へ移動できるようにするため。

#### Acceptance Criteria

1. The Hazard Map App shall 画面右下に GeolocateControl を配置し、ブラウザの位置情報 API を使用してユーザーの現在地を取得・追跡する。
2. When ユーザーが位置情報を許可して GeolocateControl を有効にする, the Hazard Map App shall 取得した座標を内部変数に保持し、地図上に現在地マーカーを表示する。
3. While ズームレベルが 7 以上かつ現在地が取得済みで避難場所レイヤーが表示中である, the Hazard Map App shall 毎フレームのレンダリング時に現在地から最寄りの避難場所を Turf.js の距離計算で特定し、直線ラインを描画する。
4. While ズームレベルが 7 未満または現在地が未取得である, the Hazard Map App shall ルートラインを非表示（空の GeoJSON）にする。
5. When GeolocateControl がオフになる, the Hazard Map App shall 現在地情報をリセットしルートラインを消去する。
6. The Hazard Map App shall ルートラインを青色（`#33aaff`）・線幅 4px で描画する。

---

### Requirement 5: 3D 地形表示

**Objective:** 利用者として、地形の起伏を立体的に確認したい。山地や河川沿いなど地形に起因する災害リスクを直感的に把握できるようにするため。

#### Acceptance Criteria

1. The Hazard Map App shall 国土地理院の標高タイルを `raster-dem` ソースとして読み込み、陰影図（hillshade）レイヤーを地図上に表示する。
2. The Hazard Map App shall 陰影図の強度を 0.2 に設定し、ベース地図の視認性を損なわない範囲で地形の起伏を表現する。
3. The Hazard Map App shall TerrainControl を地図に追加し、ユーザーが 3D 地形表示の ON/OFF を切り替えられるようにする。
4. Where TerrainControl が有効化されている, the Hazard Map App shall 標高倍率 1 倍で地形の 3D 表示を描画する。

---

### Requirement 6: PWA 対応（オフライン・モバイル利用）

**Objective:** 利用者として、モバイル端末でアプリをホーム画面に追加し、通信環境が不安定な状況でも利用したい。避難時でもアプリにアクセスできるようにするため。

#### Acceptance Criteria

1. The Hazard Map App shall Web App Manifest（`manifest.json`）を提供し、モバイルブラウザでホーム画面へのインストールを可能にする。
2. When ブラウザが Service Worker をサポートしている, the Hazard Map App shall `sw.js` を登録してリソースのキャッシュを管理する。
3. The Hazard Map App shall HTML の `<meta name="viewport">` を設定し、モバイル端末での表示を最適化する。
4. The Hazard Map App shall 地図コンテナを画面全高（`height: 100vh`）で表示し、モバイル端末でもフルスクリーンの地図体験を提供する。
