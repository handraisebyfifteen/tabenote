/**
 * 五味の集計(指示書 5-1)。この計算式は改変しない。
 *
 *   酸/苦/甘/辛/鹹    → 該当の味に 1.0
 *   微酸/微苦/微甘     → 該当の味に 0.5
 *   淡                → 甘に 0.5
 *   渋                → 酸に 0.5
 */
import type { Flavor, Food } from '../data/foods';

export const FIVE_FLAVORS = ['酸', '苦', '甘', '辛', '鹹'] as const;
export type FiveFlavor = (typeof FIVE_FLAVORS)[number];

/** 五角形の5軸の値 */
export type FlavorTotals = Record<FiveFlavor, number>;

const CONTRIBUTIONS: Record<Flavor, [FiveFlavor, number]> = {
  酸: ['酸', 1],
  苦: ['苦', 1],
  甘: ['甘', 1],
  辛: ['辛', 1],
  鹹: ['鹹', 1],
  微酸: ['酸', 0.5],
  微苦: ['苦', 0.5],
  微甘: ['甘', 0.5],
  淡: ['甘', 0.5],
  渋: ['酸', 0.5],
};

export function emptyTotals(): FlavorTotals {
  return { 酸: 0, 苦: 0, 甘: 0, 辛: 0, 鹹: 0 };
}

/** 選択した食材全体で、味ごとに合計する */
export function aggregateFlavors(foods: Food[]): FlavorTotals {
  const totals = emptyTotals();
  for (const food of foods) {
    for (const flavor of food.flavors) {
      const [axis, weight] = CONTRIBUTIONS[flavor];
      totals[axis] += weight;
    }
  }
  return totals;
}

/** 入っていない味(値が0の軸) */
export function missingFlavors(totals: FlavorTotals): FiveFlavor[] {
  return FIVE_FLAVORS.filter((f) => totals[f] === 0);
}

/** 最も強い味(同率はすべて返す)。合計0のときは空配列 */
export function dominantFlavors(totals: FlavorTotals): FiveFlavor[] {
  const max = Math.max(...FIVE_FLAVORS.map((f) => totals[f]));
  if (max <= 0) return [];
  return FIVE_FLAVORS.filter((f) => totals[f] === max);
}
