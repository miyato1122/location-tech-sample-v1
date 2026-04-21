/**
 * basemapErrorChannel.js の単体テスト
 * 失敗状態チャネルの契約を検証する
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
    createBasemapErrorChannel,
} from './basemapErrorChannel.js';

test('初期状態はエラーなし', () => {
    const channel = createBasemapErrorChannel();
    const state = channel.getState();
    assert.equal(state.hasError, false);
    assert.equal(state.layerId, null);
    assert.equal(state.message, null);
});

test('setError で失敗状態が更新される', () => {
    const channel = createBasemapErrorChannel();
    channel.setError('osm-layer', '背景地図を表示できませんでした');
    const state = channel.getState();
    assert.equal(state.hasError, true);
    assert.equal(state.layerId, 'osm-layer');
    assert.ok(state.message);
});

test('clearError で失敗状態がリセットされる', () => {
    const channel = createBasemapErrorChannel();
    channel.setError('osm-layer', '失敗');
    channel.clearError();
    const state = channel.getState();
    assert.equal(state.hasError, false);
    assert.equal(state.layerId, null);
});

test('リスナーが setError 時に呼ばれる', () => {
    const channel = createBasemapErrorChannel();
    let called = false;
    channel.subscribe(() => {
        called = true;
    });
    channel.setError('gsi-std-layer', '失敗');
    assert.ok(called);
});

test('リスナーが clearError 時に呼ばれる', () => {
    const channel = createBasemapErrorChannel();
    channel.setError('osm-layer', '失敗');
    let called = false;
    channel.subscribe(() => {
        called = true;
    });
    channel.clearError();
    assert.ok(called);
});
