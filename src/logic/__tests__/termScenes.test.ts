/**
 * 節気の風景データのテスト。
 * 24節気ぶん揃っていること、色や秒数が描画できる値であることを確かめる
 * (色は手書きなので、綴りの崩れが画面まで届かないようにする)。
 */
import { describe, expect, it } from 'vitest';

import { TERM_SCENES, getTermScene } from '../../data/termScenes';
import { SOLAR_TERMS } from '../solarTerms';

const HEX = /^#[0-9A-Fa-f]{6}$/;

describe('節気の風景', () => {
  it('24節気ぶんある', () => {
    expect(TERM_SCENES).toHaveLength(SOLAR_TERMS.length);
  });

  it('通し番号から引ける(範囲外は折り返す)', () => {
    expect(getTermScene(0)).toBe(TERM_SCENES[0]);
    expect(getTermScene(23)).toBe(TERM_SCENES[23]);
    expect(getTermScene(24)).toBe(TERM_SCENES[0]);
    expect(getTermScene(-1)).toBe(TERM_SCENES[23]);
  });

  it('色はすべて #RRGGBB', () => {
    for (const scene of TERM_SCENES) {
      for (const color of scene.sky) expect(color).toMatch(HEX);
      expect(scene.accent).toMatch(HEX);
      if (scene.orb !== null) {
        expect(scene.orb.color).toMatch(HEX);
        expect(scene.orb.glow).toMatch(HEX);
      }
      for (const ridge of scene.ridges) expect(ridge.color).toMatch(HEX);
      for (const layer of scene.layers) expect(layer.color).toMatch(HEX);
    }
  });

  it('粒子と稜線は描ける値になっている', () => {
    for (const scene of TERM_SCENES) {
      expect(scene.ridges.length).toBeGreaterThan(0);
      expect(scene.layers.length).toBeGreaterThan(0);
      for (const layer of scene.layers) {
        expect(layer.count).toBeGreaterThan(0);
        expect(layer.size).toBeGreaterThan(0);
        expect(layer.duration).toBeGreaterThan(0);
        expect(layer.opacity).toBeGreaterThan(0);
        expect(layer.opacity).toBeLessThanOrEqual(1);
      }
      for (const ridge of scene.ridges) {
        expect(ridge.y).toBeGreaterThan(0);
        expect(ridge.y).toBeLessThan(1);
      }
    }
  });

  it('太陽・月は画面の中に置かれている', () => {
    for (const scene of TERM_SCENES) {
      if (scene.orb === null) continue;
      expect(scene.orb.x).toBeGreaterThan(0);
      expect(scene.orb.x).toBeLessThan(1);
      expect(scene.orb.y).toBeGreaterThan(0);
      expect(scene.orb.y).toBeLessThan(1);
      expect(scene.orb.r).toBeGreaterThan(0);
    }
  });
});
