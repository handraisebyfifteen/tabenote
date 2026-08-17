/**
 * 5大分類の網羅性(指示書 5-3)。
 * 含まれていない分類を「入っていません」と提示するための判定。
 */
import { ALL_CAT5, type Cat5, type Food } from '../data/foods';

/** 選択食材に含まれる分類 */
export function coveredCats(foods: Food[]): Cat5[] {
  const present = new Set(foods.map((f) => f.cat5));
  return ALL_CAT5.filter((c) => present.has(c));
}

/** 含まれていない分類 */
export function missingCats(foods: Food[]): Cat5[] {
  const present = new Set(foods.map((f) => f.cat5));
  return ALL_CAT5.filter((c) => !present.has(c));
}
