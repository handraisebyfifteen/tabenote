/**
 * 性が正反対の組み合わせの検知(指示書 5-4)。
 *
 * 「料理としての釣り合いの指摘」であり、健康の話にはしない。
 * メッセージは「性が正反対なので同じ皿には向きません」の趣旨で出す。
 *
 * しきい値について:
 *   指示書 5-4 の例は 熱(+2)×寒(-2) = 差4、
 *   設計書 3-8 の例は カツオ(温+1)×スイカ(寒-2) = 差3。
 *   両方を拾うため「符号が逆で差が3以上」を正反対とみなす。
 *   (温×涼 = 差2 は対象外)
 */
import type { Food } from '../data/foods';
import { natureValue } from './nature';

export const OPPOSITE_NATURE_THRESHOLD = 3;

export interface OppositePair {
  a: Food;
  b: Food;
  diff: number;
}

/**
 * 性の数値差が最大のペアを返す。
 * 符号が逆(温側×寒側)かつ差がしきい値以上のペアがなければ null。
 */
export function findOppositePair(foods: Food[]): OppositePair | null {
  let best: OppositePair | null = null;
  for (let i = 0; i < foods.length; i++) {
    for (let j = i + 1; j < foods.length; j++) {
      const va = natureValue(foods[i]);
      const vb = natureValue(foods[j]);
      const oppositeSigns = (va > 0 && vb < 0) || (va < 0 && vb > 0);
      if (!oppositeSigns) continue;
      const diff = Math.abs(va - vb);
      if (diff < OPPOSITE_NATURE_THRESHOLD) continue;
      if (best === null || diff > best.diff) {
        best = { a: foods[i], b: foods[j], diff };
      }
    }
  }
  return best;
}
