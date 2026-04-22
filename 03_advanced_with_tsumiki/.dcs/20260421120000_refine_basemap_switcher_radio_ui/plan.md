# 修正計画

**作成日時**: 20260421120000
**修正概要**: 背景地図切り替えUIをアイコン+ドロップダウンから常時表示のラジオボタンパネルに変更する
**修正種別**: 複合（コード + ドキュメント）

---

## 修正対象ファイル

| ファイル | 該当行 | 内容 |
|---------|--------|------|
| `main.js` | L484-L514 | `_buildUI()` をラジオボタン方式に置き換え、`_toggle()` を削除 |
| `main.js` | L529-L531 | `_switchBasemap()` 末尾の DOM 操作（ボタン active クラス更新）を削除 |
| `style.css` | L1-L57（全体） | ドロップダウン用スタイルを削除し、ラジオボタンパネル用に全面書き替え |

---

### 修正前後の詳細

#### `main.js` — `_buildUI()` と `_toggle()` の置き換え（L484-L514）

**修正前**:
```javascript
    _buildUI() {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'basemap-switcher-toggle';
        toggleBtn.setAttribute('aria-label', '背景地図を切り替える');
        toggleBtn.textContent = '🗺';
        toggleBtn.addEventListener('click', () => this._toggle());

        const menu = document.createElement('div');
        menu.className = 'basemap-switcher-menu';
        menu.hidden = true;

        this._basemaps.forEach(({ id, label }) => {
            const btn = document.createElement('button');
            btn.className = 'basemap-switcher-item' + (id === this._currentBasemap ? ' active' : '');
            btn.textContent = label;
            btn.dataset.id = id;
            btn.addEventListener('click', () => {
                this._switchBasemap(id);
                this._toggle();
            });
            menu.appendChild(btn);
        });

        this._menu = menu;
        this._container.appendChild(toggleBtn);
        this._container.appendChild(menu);
    }

    _toggle() {
        this._menu.hidden = !this._menu.hidden;
    }
```

**修正後**:
```javascript
    _buildUI() {
        this._basemaps.forEach(({ id, label }) => {
            const itemEl = document.createElement('label');
            itemEl.className = 'basemap-switcher-item';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'basemap';
            radio.value = id;
            radio.checked = id === this._currentBasemap;
            radio.addEventListener('change', () => this._switchBasemap(id));

            itemEl.appendChild(radio);
            itemEl.appendChild(document.createTextNode(label));
            this._container.appendChild(itemEl);
        });
    }
```

**修正理由**: ドロップダウン方式ではアイコン（🗺）と文字がつぶれて視認しにくいため、常時表示のラジオボタンパネルに変更する。`_toggle()` はドロップダウンの開閉のためだけに使用していたため、不要になる。

---

#### `main.js` — `_switchBasemap()` 末尾3行の削除（L529-L531）

**修正前** (`_switchBasemap` 末尾):
```javascript
        this._menu.querySelectorAll('.basemap-switcher-item').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.id === id);
        });
```

**修正後**: （この3行を削除）

**修正理由**: ラジオボタン方式では `<input type="radio">` の `checked` 状態がブラウザによって自動管理されるため、手動でのDOM状態更新が不要になる。また、`this._menu` への参照自体がなくなる。

---

#### `style.css` — 全面書き替え

**修正前** (現在の内容 L1-L57):
```css
/* 背景地図切り替えコントロール */
.basemap-switcher {
    position: relative;
}

.basemap-switcher-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 29px;
    height: 29px;
    background: #fff;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 0;
}

.basemap-switcher-toggle:hover {
    background-color: #f2f2f2;
}

.basemap-switcher-menu {
    position: absolute;
    bottom: 100%;
    left: 0;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    margin-bottom: 4px;
    min-width: 90px;
    overflow: hidden;
}

.basemap-switcher-item {
    display: block;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    text-align: left;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
    min-height: 44px;
    line-height: 28px;
}

.basemap-switcher-item:hover {
    background-color: #f2f2f2;
}

.basemap-switcher-item.active {
    font-weight: bold;
    background-color: #e8f0fe;
    color: #1a73e8;
}
```

**修正後**:
```css
/* 背景地図切り替えコントロール */
.basemap-switcher {
    background: #fff;
    padding: 4px 8px;
}

.basemap-switcher-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 0;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
}

.basemap-switcher-item input[type="radio"] {
    cursor: pointer;
    margin: 0;
    accent-color: #1a73e8;
}
```

**修正理由**: ドロップダウン専用のスタイル（`.basemap-switcher-toggle`、`.basemap-switcher-menu`、`.active` クラス）を削除し、常時表示ラジオボタンパネルに必要なスタイルのみにシンプル化する。

---

## 影響範囲

### 影響を受けるファイル

| ファイル | 影響の種類 | 対応要否 |
|---------|-----------|---------|
| `docs/design/basemap-switcher/architecture.md` | DOM構造のサンプルが古くなる | 不要（設計参考文書のため許容） |
| `docs/tasks/basemap-switcher/TASK-0002.md` | 完了条件・サンプルコードが古くなる | 不要（完了済みタスクのため） |
| `docs/tasks/basemap-switcher/TASK-0003.md` | CSS期待値が古くなる | 不要（完了済みタスクのため） |

### 関連テストファイル

| テストファイル | 対応内容 |
|--------------|---------|
| （テストファイルなし） | 現プロジェクトにテストは未整備（`docs/README.md` 参照） |

---

## リスク・注意事項

- **`_toggle()` の削除**: `_buildUI()` 内で `this._toggle()` を呼んでいた箇所も同時に消えるため、呼び出し漏れは発生しない
- **`this._menu` 参照の削除**: `_switchBasemap()` で `this._menu.querySelectorAll(...)` を使っていた行も削除するため、`undefined` 参照エラーは発生しない
- **ラジオボタンの `name` 属性**: 同一ページに複数の地図コントロールが存在した場合に干渉する可能性があるが、本アプリは単一インスタンスのため問題なし
- **破壊的変更**: 既存のドロップダウン UI から ラジオボタン UI へのUIの変更であり、地図切り替え機能自体（`_switchBasemap` の MapLibre GL JS 呼び出し）は変更しない

---

## 確認手順

### ビルド確認
```
npm run build
```

### 目視確認
```
npm run dev
```
ブラウザで以下を確認する:
- 画面左下に「OSM」「地理院地図」「航空写真」のラジオボタンが常時表示されること
- 各ラジオボタンをクリックすると背景地図が切り替わること
- 切り替え後もハザードマップ・避難場所レイヤーが維持されること

### セキュリティ確認観点
- 入力値のバリデーション変更の有無: なし（ラジオボタンの value は内部定数のみ）
- 認証・認可ロジックの変更の有無: なし
- 外部入力を扱う箇所の変更の有無: なし
- SQLインジェクション・XSS等のリスクの有無: なし（DOM 操作のみ）

---

*このplanファイルは `/tsumiki:refine-execute .dcs/20260421120000_refine_basemap_switcher_radio_ui/plan.md` で実行できます*
