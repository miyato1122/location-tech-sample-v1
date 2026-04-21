/**
 * basemapControl.js の単体テスト
 * 軽量なDOMモックでボタン生成・選択中状態を検証する
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { BASEMAP_CATALOG } from './basemapCatalog.js';
import { mountBasemapControl } from './basemapControl.js';

/** 最小限のDOMモック */
function createDOMElement(tag = 'div') {
    const children = [];
    const classList = new Set();
    const dataset = {};
    let classNameValue = '';

    const el = {
        tagName: tag.toUpperCase(),
        textContent: '',
        get className() {
            return classNameValue;
        },
        set className(value) {
            classList.clear();
            for (const name of String(value).split(/\s+/).filter(Boolean)) {
                classList.add(name);
            }
            classNameValue = [...classList].join(' ');
        },
        dataset,
        classList: {
            add(...names) { for (const n of names) classList.add(n); classNameValue = [...classList].join(' '); },
            remove(...names) { for (const n of names) classList.delete(n); classNameValue = [...classList].join(' '); },
            toggle(name, force) {
                if (force === undefined) {
                    if (classList.has(name)) { classList.delete(name); } else { classList.add(name); }
                } else {
                    if (force) { classList.add(name); } else { classList.delete(name); }
                }
                classNameValue = [...classList].join(' ');
            },
            contains(name) { return classList.has(name); },
        },
        _listeners: {},
        addEventListener(event, fn) {
            if (!this._listeners[event]) this._listeners[event] = [];
            this._listeners[event].push(fn);
        },
        _trigger(event) {
            for (const fn of (this._listeners[event] || [])) fn();
        },
        appendChild(child) { children.push(child); },
        querySelectorAll(selector) {
            // サポート: .basemap-control__btn
            const cls = selector.replace(/^\./, '');
            return children.filter((c) => c.classList.contains(cls));
        },
        _children: children,
    };
    return el;
}

function createServiceMock(initialId = 'osm') {
    let current = initialId;
    return {
        getCurrentBasemap() { return current; },
        switchBasemap(id) {
            const valid = BASEMAP_CATALOG.some((c) => c.id === id);
            if (!valid || id === current) return { changed: false, current };
            current = id;
            return { changed: true, current };
        },
    };
}

function installDocumentMock() {
    globalThis.document = {
        createElement() {
            return createDOMElement('button');
        },
    };
}

test('mountBasemapControl は3件のボタンを生成する', () => {
    installDocumentMock();
    const container = createDOMElement();
    const attributionEl = createDOMElement();
    const service = createServiceMock();

    mountBasemapControl({ container, attributionEl, service });

    assert.equal(container._children.length, 3);
});

test('各ボタンにカタログの label が設定される', () => {
    installDocumentMock();
    const container = createDOMElement();
    const attributionEl = createDOMElement();
    const service = createServiceMock();

    mountBasemapControl({ container, attributionEl, service });

    const labels = container._children.map((btn) => btn.textContent);
    for (const item of BASEMAP_CATALOG) {
        assert.ok(labels.includes(item.label), `${item.label} がボタンに存在すること`);
    }
});

test('初期表示では osm ボタンが active クラスを持つ', () => {
    installDocumentMock();
    const container = createDOMElement();
    const attributionEl = createDOMElement();
    const service = createServiceMock('osm');

    mountBasemapControl({ container, attributionEl, service });

    const activeBtn = container._children.find((btn) =>
        btn.classList.contains('basemap-control__btn--active'),
    );
    assert.ok(activeBtn, 'active クラスのボタンが存在すること');
    assert.equal(activeBtn.dataset.basemapId, 'osm');
});

test('ボタンクリックで切り替え後は対象ボタンが active になる', () => {
    installDocumentMock();
    const container = createDOMElement();
    const attributionEl = createDOMElement();
    const service = createServiceMock('osm');

    mountBasemapControl({ container, attributionEl, service });

    // gsiStd ボタンをクリック
    const gsiStdBtn = container._children.find((b) => b.dataset.basemapId === 'gsiStd');
    gsiStdBtn._trigger('click');

    assert.ok(gsiStdBtn.classList.contains('basemap-control__btn--active'));
    // osm ボタンは非 active
    const osmBtn = container._children.find((b) => b.dataset.basemapId === 'osm');
    assert.ok(!osmBtn.classList.contains('basemap-control__btn--active'));
});

test('初期出典表示が osm の attributionText に一致する', () => {
    installDocumentMock();
    const container = createDOMElement();
    const attributionEl = createDOMElement();
    const service = createServiceMock('osm');
    const osmItem = BASEMAP_CATALOG.find((c) => c.id === 'osm');

    mountBasemapControl({ container, attributionEl, service });

    assert.equal(attributionEl.textContent, osmItem.attributionText);
});
