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

/**
 * アドバイスで「入っていません」と指摘する分類。
 * 調味料・飲み物は調理の過程で自然に加わるため、不足として数えない
 * (数えると「調味料が入っていません」という空振りの指摘になる)。
 */
export function adviceMissingCats(foods: Food[]): Cat5[] {
  return missingCats(foods).filter((c) => c !== 'season');
}
