import test from 'node:test';
import assert from 'node:assert/strict';
import { createBasemapErrorChannel } from './basemapErrorChannel.js';
import { bindBasemapErrorPresenter } from './basemapErrorPresenter.js';

function createErrorElementMock() {
    return {
        textContent: '',
        style: {
            display: '',
        },
    };
}

test('初期表示はエラーメッセージ非表示', () => {
    const channel = createBasemapErrorChannel();
    const el = createErrorElementMock();

    bindBasemapErrorPresenter(channel, el);

    assert.equal(el.style.display, 'none');
    assert.equal(el.textContent, '');
});

test('失敗時はメッセージを表示する', () => {
    const channel = createBasemapErrorChannel();
    const el = createErrorElementMock();

    bindBasemapErrorPresenter(channel, el);
    channel.setError('osm-layer', '背景地図を表示できませんでした');

    assert.equal(el.style.display, 'block');
    assert.equal(el.textContent, '背景地図を表示できませんでした');
});

test('回復時はメッセージを非表示に戻す', () => {
    const channel = createBasemapErrorChannel();
    const el = createErrorElementMock();

    bindBasemapErrorPresenter(channel, el);
    channel.setError('osm-layer', '背景地図を表示できませんでした');
    channel.clearError();

    assert.equal(el.style.display, 'none');
    assert.equal(el.textContent, '');
});
