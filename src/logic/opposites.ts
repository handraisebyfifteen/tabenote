/**
 * 性が正反対の組み合わせの検知(指示書 5-4)。
 *
 * 「料理としての釣り合いの指摘」であり、健康の話にはしない。
 *
 * しきい値について:
 *   指示書 5-4 の例は 熱(+2)×寒(-2) = 差4、
 *   設計書 3-8 の例は カツオ(温+1)×スイカ(寒-2) = 差3。
 *   両方を拾うため「符号が逆で差が3以上」を正反対とみなす。
 *   (温×涼 = 差2 は対象外)
 *
 * 調味料・油脂・飲み物(cat5 = 'season')の扱い:
 *   しお・しょうゆは寒(-2)、こしょう・とうがらしは熱(+2) なので、
 *   素通しにすると「塩こしょう」「しょうゆと生姜」のような当たり前の
 *   組み合わせが最大差のペアとして拾われ、「同じ皿には向きません」と
 *   出てしまっていた。塩は献立から外せる類のものではないので、
 *   この指摘は利用者にとって空振りになる。
 *
 *   そこで2つに分ける。
 *     1. 主材料どうしのペアを先に探す(設計書 3-8 のカツオ×スイカはこちら)
 *     2. 見つからないときだけ、調味料がからむペアを返す
 *   調味料がらみは involvesSeasoning で区別し、画面側で
 *   「量で釣り合いを取れる」という伝え方にする。出典も
 *   「合わせる食材を工夫してバランスを崩さないように調理し」であり、
 *   同じ皿を禁じてはいない(設計書 3-8 の引用)。
 *
 *   不足分類の判定で調味料を数えないのと同じ方針(coverage.adviceMissingCats)。
 */
import type { Food } from '../data/foods';
import { natureValue } from './nature';

export const OPPOSITE_NATURE_THRESHOLD = 3;

export interface OppositePair {
  a: Food;
  b: Food;
  diff: number;
  /**
   * 片方または両方が調味料・油脂・飲み物。
   * true のときは「同じ皿に向かない」ではなく「量で加減できる」と伝える。
   */
  involvesSeasoning: boolean;
}

/** 量で加減する側(調味料・油脂・砂糖・飲み物・酒) */
function isSeasoning(food: Food): boolean {
  return food.cat5 === 'season';
}

/** 符号が逆かつ差がしきい値以上のペアのうち、差が最大のもの */
function maxOppositePair(
  foods: Food[],
  accept: (a: Food, b: Food) => boolean,
): OppositePair | null {
  let best: OppositePair | null = null;
  for (let i = 0; i < foods.length; i++) {
    for (let j = i + 1; j < foods.length; j++) {
      if (!accept(foods[i], foods[j])) continue;
      const va = natureValue(foods[i]);
      const vb = natureValue(foods[j]);
      const oppositeSigns = (va > 0 && vb < 0) || (va < 0 && vb > 0);
      if (!oppositeSigns) continue;
      const diff = Math.abs(va - vb);
      if (diff < OPPOSITE_NATURE_THRESHOLD) continue;
      if (best === null || diff > best.diff) {
        best = {
          a: foods[i],
          b: foods[j],
          diff,
          involvesSeasoning: isSeasoning(foods[i]) || isSeasoning(foods[j]),
        };
      }
    }
  }
  return best;
}

/**
 * 性の数値差が最大のペアを返す。該当がなければ null。
 *
 * 主材料どうしを優先し、無いときだけ調味料がからむペアを返す
 * (調味料のほうが差が大きくても、主材料の指摘を埋めない)。
 */
export function findOppositePair(foods: Food[]): OppositePair | null {
  const mainsOnly = maxOppositePair(
    foods,
    (a, b) => !isSeasoning(a) && !isSeasoning(b),
  );
  return mainsOnly ?? maxOppositePair(foods, () => true);
}
