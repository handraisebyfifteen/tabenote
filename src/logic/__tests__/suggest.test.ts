/**
 * 「補うなら」候補ロジックのテスト。
 * 実データ(SELECTABLE_FOODS)に対して、性質ベースで検証する。
 */
import { describe, expect, it } from 'vitest';
import { FIVE_FLAVORS } from '../flavors';
import { aggregateFlavors } from '../flavors';
import {
  EMPTY_SUGGESTION_CONTEXT,
  SUGGESTION_LIMIT,
  fillSuggestions,
  foodsWithFlavor,
} from '../suggest';
import { SELECTABLE_FOODS } from '../../data/foods';

describe('foodsWithFlavor', () => {
  it('どの味にも候補となる食材が存在する', () => {
    for (const flavor of FIVE_FLAVORS) {
      expect(foodsWithFlavor(flavor).length, flavor).toBeGreaterThan(0);
    }
  });

  it('返る食材はすべてその味に寄与している', () => {
    for (const flavor of FIVE_FLAVORS) {
      for (const food of foodsWithFlavor(flavor)) {
        expect(aggregateFlavors([food])[flavor], `${flavor}: ${food.name}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('fillSuggestions', () => {
  it('何も選んでいなければ、五味すべて・5分類すべてが「足りない」扱いになる', () => {
    const s = fillSuggestions([], EMPTY_SUGGESTION_CONTEXT);
    expect(s.flavors.map((x) => x.flavor)).toEqual([...FIVE_FLAVORS]);
    expect(s.cats.length).toBe(5);
    for (const f of s.flavors) {
      expect(f.foods.length).toBeLessThanOrEqual(SUGGESTION_LIMIT);
      expect(f.foods.length).toBeGreaterThan(0);
    }
  });

  it('候補に選択済みの食材は含まれない', () => {
    const selected = SELECTABLE_FOODS.slice(0, 30);
    const selectedIds = new Set(selected.map((f) => f.id));
    const s = fillSuggestions(selected, EMPTY_SUGGESTION_CONTEXT);
    for (const group of [...s.flavors, ...s.cats]) {
      for (const food of group.foods) {
        expect(selectedIds.has(food.id), food.name).toBe(false);
      }
    }
  });

  it('候補は足りない味・足りない分類のものだけ', () => {
    // 甘だけを持つ食材を1つ選ぶ → 甘は足りている扱いになる
    const sweetOnly = SELECTABLE_FOODS.find(
      (f) => aggregateFlavors([f]).甘 > 0 && FIVE_FLAVORS.every(
        (fl) => fl === '甘' || aggregateFlavors([f])[fl] === 0,
      ),
    );
    expect(sweetOnly).toBeDefined();
    const s = fillSuggestions([sweetOnly!], EMPTY_SUGGESTION_CONTEXT);
    expect(s.flavors.map((x) => x.flavor)).not.toContain('甘');
    expect(s.cats.map((x) => x.cat)).not.toContain(sweetOnly!.cat5);
    for (const group of s.flavors) {
      for (const food of group.foods) {
        expect(aggregateFlavors([food])[group.flavor]).toBeGreaterThan(0);
      }
    }
    for (const group of s.cats) {
      for (const food of group.foods) {
        expect(food.cat5).toBe(group.cat);
      }
    }
  });

  it('お気に入りは候補の先頭に上がる', () => {
    // 酸に寄与する食材のうち、既定の並びで最後尾のものをお気に入りにする
    const pool = foodsWithFlavor('酸');
    const last = pool[pool.length - 1];
    const s = fillSuggestions([], {
      favorites: [last.id],
      selectionHistory: {},
      seasonNatureLevels: [],
    });
    const sour = s.flavors.find((x) => x.flavor === '酸');
    expect(sour!.foods[0].id).toBe(last.id);
  });

  it('選択回数の多い食材はお気に入りの次に上がる', () => {
    const pool = foodsWithFlavor('鹹');
    expect(pool.length).toBeGreaterThan(2);
    const favorite = pool[pool.length - 1];
    const often = pool[pool.length - 2];
    const s = fillSuggestions([], {
      favorites: [favorite.id],
      selectionHistory: { [often.id]: 5 },
      seasonNatureLevels: [],
    });
    const salty = s.flavors.find((x) => x.flavor === '鹹');
    expect(salty!.foods[0].id).toBe(favorite.id);
    expect(salty!.foods[1].id).toBe(often.id);
  });
});
