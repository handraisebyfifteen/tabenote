/**
 * 「補うなら」候補ロジックのテスト。
 * 実データ(SELECTABLE_FOODS)に対して、性質ベースで検証する。
 */
import { describe, expect, it } from 'vitest';
import { FIVE_FLAVORS , aggregateFlavors } from '../flavors';
import {
  EMPTY_SUGGESTION_CONTEXT,
  SUGGESTION_LIMIT,
  complementOrder,
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
  it('何も選んでいなければ、五味すべてと主な4分類が「足りない」扱いになる', () => {
    // 調味料・飲み物は調理で自然に加わるため不足として数えない
    const s = fillSuggestions([], EMPTY_SUGGESTION_CONTEXT);
    expect(s.flavors.map((x) => x.flavor)).toEqual([...FIVE_FLAVORS]);
    expect(s.cats.length).toBe(4);
    expect(s.cats.map((x) => x.cat)).not.toContain('season');
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

  it('page を進めると「ほかの候補」の窓がずれ、順位順に一巡して巻き戻る', () => {
    const pool = foodsWithFlavor('酸');
    const page0 = fillSuggestions([], EMPTY_SUGGESTION_CONTEXT, 0)
      .flavors.find((x) => x.flavor === '酸')!.foods;
    const page1 = fillSuggestions([], EMPTY_SUGGESTION_CONTEXT, 1)
      .flavors.find((x) => x.flavor === '酸')!.foods;
    expect(page1.map((f) => f.id)).not.toEqual(page0.map((f) => f.id));
    // 窓は順位順の続き(page1 の先頭 = 順位 SUGGESTION_LIMIT 番目)
    expect(page1[0].id).toBe(pool[SUGGESTION_LIMIT].id);
    // プール全体を一巡すると最初の窓に戻る
    const pages = Math.ceil(pool.length / SUGGESTION_LIMIT);
    const wrapped = fillSuggestions([], EMPTY_SUGGESTION_CONTEXT, pages * pool.length)
      .flavors.find((x) => x.flavor === '酸')!.foods;
    expect(wrapped.map((f) => f.id)).toEqual(page0.map((f) => f.id));
  });
});

describe('complementOrder(グリッドのリフレッシュ並び)', () => {
  it('選択が空なら掲載順のまま全件返す', () => {
    const r = complementOrder([], EMPTY_SUGGESTION_CONTEXT);
    expect(r).toEqual(SELECTABLE_FOODS);
  });

  it('選択済みは結果に含まれない', () => {
    const first = SELECTABLE_FOODS[0];
    const r = complementOrder([first], EMPTY_SUGGESTION_CONTEXT);
    expect(r.some((f) => f.id === first.id)).toBe(false);
    expect(r.length).toBe(SELECTABLE_FOODS.length - 1);
  });

  it('選んだ分類は沈み、まだ入っていない分類が前に出る', () => {
    const grain = SELECTABLE_FOODS.find((f) => f.cat5 === 'grain')!;
    const r = complementOrder([grain], EMPTY_SUGGESTION_CONTEXT);
    // 先頭は穀類・豆以外(未カバー分類が最上段)
    expect(r[0].cat5).not.toBe('grain');
    // 同じ分類の食材より、未カバー分類の食材が必ず先に来る
    const firstGrain = r.findIndex((f) => f.cat5 === 'grain');
    const lastNonGrain = r.map((f) => f.cat5).lastIndexOf(
      r.find((f) => f.cat5 !== 'grain')!.cat5,
    );
    expect(firstGrain).toBeGreaterThan(-1);
    expect(lastNonGrain).toBeGreaterThan(-1);
  });

  it('同じ補完段の中ではお気に入りが先頭に上がる', () => {
    const grain = SELECTABLE_FOODS.find((f) => f.cat5 === 'grain')!;
    // 未カバー分類(穀類以外)の食材のうち掲載順で後ろのものを★にする
    const pool = SELECTABLE_FOODS.filter((f) => f.cat5 !== 'grain');
    const fav = pool[pool.length - 1];
    const r = complementOrder([grain], {
      favorites: [fav.id],
      selectionHistory: {},
      seasonNatureLevels: [],
    });
    // ★は自分の補完段(未カバー分類)の先頭に来る
    const sameTier = r.filter((f) => f.cat5 !== 'grain');
    expect(sameTier[0].id).toBe(fav.id);
  });
});
