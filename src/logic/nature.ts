/**
 * 性(寒熱)の集計(指示書 5-2)。この計算式は改変しない。
 *
 *   熱 = +2, 温/微温 = +1, 平 = 0, 涼/微涼 = -1, 寒/微寒 = -2
 *
 * 選択食材の平均値を四捨五入して -2〜+2 の5段階にする。
 * 数値そのものは画面に出さない(色のグラデーションで表現する)。
 */
import type { Food, Nature } from '../data/foods';

export const NATURE_VALUES: Record<Exclude<Nature, ''>, number> = {
  熱: 2,
  温: 1,
  微温: 1,
  平: 0,
  涼: -1,
  微涼: -1,
  寒: -2,
  微寒: -2,
};

export function natureValue(food: Food): number {
  if (food.nature === '') {
    throw new Error(`参照のみ項目は選択できません: ${food.name}`);
  }
  return NATURE_VALUES[food.nature];
}

/** 0.5 を 0 から遠い側へ丸める四捨五入(-0.5 → -1) */
function roundHalfAwayFromZero(x: number): number {
  return Math.sign(x) * Math.round(Math.abs(x));
}

/**
 * 選択食材全体の性のレベル(-2〜+2 の整数)。
 * 食材が空のときは null(表示なし)。
 */
export function averageNatureLevel(foods: Food[]): number | null {
  if (foods.length === 0) return null;
  const sum = foods.reduce((acc, f) => acc + natureValue(f), 0);
  return roundHalfAwayFromZero(sum / foods.length);
}
