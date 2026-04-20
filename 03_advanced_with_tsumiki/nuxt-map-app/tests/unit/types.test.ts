import { describe, it, expect } from 'vitest'
import { DISASTER_LABELS, SKHB_LAYER_IDS, MAP_INIT_CONFIG, HAZARD_LAYER_DEFINITIONS } from '~/types/index'

describe('型定義・定数の検証', () => {
  it('DISASTER_LABELS は8種の災害ラベルを持つ', () => {
    expect(Object.keys(DISASTER_LABELS)).toHaveLength(8)
    expect(DISASTER_LABELS[1]).toBe('洪水')
    expect(DISASTER_LABELS[8]).toBe('火山現象')
  })

  it('SKHB_LAYER_IDS は8つのレイヤーIDを持つ', () => {
    expect(SKHB_LAYER_IDS).toHaveLength(8)
    expect(SKHB_LAYER_IDS[0]).toBe('skhb-1-layer')
  })

  it('MAP_INIT_CONFIG の初期値が正しい', () => {
    expect(MAP_INIT_CONFIG.zoom).toBe(5)
    expect(MAP_INIT_CONFIG.center).toEqual([138, 37])
  })

  it('HAZARD_LAYER_DEFINITIONS は6種のハザードを持つ', () => {
    expect(HAZARD_LAYER_DEFINITIONS).toHaveLength(6)
    expect(HAZARD_LAYER_DEFINITIONS[0].id).toBe('hazard_flood-layer')
  })
})
