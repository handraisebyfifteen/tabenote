/**
 * 「いまの季節に合う食材」のテスト。
 * 候補は季節の推奨(性と味)と必ず一致していること、
 * 同じ日なら同じ結果、日が変われば入れ替わることを確かめる。
 */
import { describe, expect, it } from 'vitest';

import { natureValue } from '../nature';
import { aggregateFlavors } from '../flavors';
import { SEASON_RECOMMENDATIONS, type FiveSeason } from '../season';
import { seasonMatchingFoods, seasonalPicks } from '../seasonFoods';

const SEASONS: FiveSeason[] = ['spring', 'summer', 'doyo', 'autumn', 'winter'];

describe('季節に合う食材', () => {
  it('どの季節でも、推奨の性と味の両方に合っている', () => {
    for (const season of SEASONS) {
      const rec = SEASON_RECOMMENDATIONS[season];
      const foods = seasonMatchingFoods(season);
      expect(foods.length).toBeGreaterThan(0);
      for (const food of foods) {
        expect(rec.natureLevels).toContain(natureValue(food));
        const totals = aggregateFlavors([food]);
        expect(rec.flavors.some((flavor) => totals[flavor] > 0)).toBe(true);
      }
    }
  });

  it('調味料・飲み物(season)は出さない', () => {
    for (const season of SEASONS) {
      for (const food of seasonMatchingFoods(season)) {
        expect(food.cat5).not.toBe('season');
      }
    }
  });

  it('同じ日なら同じ、日が変われば入れ替わる', () => {
    const day1 = seasonalPicks('autumn', 20000, 8);
    expect(seasonalPicks('autumn', 20000, 8)).toEqual(day1);
    expect(day1).toHaveLength(8);
    expect(seasonalPicks('autumn', 20001, 8)).not.toEqual(day1);
  });

  it('同じ食材が2回出てこない', () => {
    for (const season of SEASONS) {
      const picks = seasonalPicks(season, 12345, 8);
      expect(new Set(picks.map((f) => f.id)).size).toBe(picks.length);
    }
  });

  it('exclude に入れた食材は飛ばし、そのぶん後ろから補って数を保つ', () => {
    const plain = seasonalPicks('autumn', 12345, 8);
    const dropped = new Set([plain[0].id, plain[3].id]);
    const picks = seasonalPicks('autumn', 12345, 8, dropped);

    for (const id of dropped) expect(picks.map((f) => f.id)).not.toContain(id);
    expect(picks).toHaveLength(8);
    // 除外は窓をずらしたあとに掛かるので、残ったぶんの並びは動かない
    expect(picks.slice(0, 6).map((f) => f.id)).toEqual(
      plain.filter((f) => !dropped.has(f.id)).map((f) => f.id),
    );
  });
});
