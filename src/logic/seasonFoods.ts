/**
 * 「いまの旬」の候補(指示書 6-1「行動につながる」導線)。
 *
 * 参照データに旬(月)の情報は持たせていないため、旬をこちらで作らない。
 * 季節の推奨(SEASON_RECOMMENDATIONS)に合う食材 —— 推奨の性であり、
 * かつ推奨の味を持つもの —— を候補にする。判定と表示が同じ根拠になる。
 *
 * 並びは参照データの掲載順で固定し、暦日ごとに窓をずらす。
 * 開くたびに違う顔が出るが、同じ日なら何度開いても同じものが出る。
 */
import { SELECTABLE_FOODS, type Cat5, type Food } from '../data/foods';
import { aggregateFlavors } from './flavors';
import { natureValue } from './nature';
import { SEASON_RECOMMENDATIONS, type FiveSeason } from './season';

/** 調味料・飲み物(season)は「旬の食材」として出さない */
const SHOWN_CATS: Cat5[] = ['grain', 'veg', 'fruit', 'protein'];

/** その季節の推奨(性と味の両方)に合う食材。掲載順 */
export function seasonMatchingFoods(season: FiveSeason): Food[] {
  const rec = SEASON_RECOMMENDATIONS[season];
  return SELECTABLE_FOODS.filter((food) => {
    if (!SHOWN_CATS.includes(food.cat5)) return false;
    if (!rec.natureLevels.includes(natureValue(food))) return false;
    const totals = aggregateFlavors([food]);
    return rec.flavors.some((flavor) => totals[flavor] > 0);
  });
}

/**
 * 今日ぶんの「いまの旬」。
 * dayNum は calendarDayNumber(暦日の通し番号)。同じ日なら同じ結果を返す。
 */
export function seasonalPicks(
  season: FiveSeason,
  dayNum: number,
  limit: number,
): Food[] {
  const pool = seasonMatchingFoods(season);
  if (pool.length === 0) return [];
  if (pool.length <= limit) return pool;
  const start = ((dayNum % pool.length) + pool.length) % pool.length;
  return Array.from({ length: limit }, (_, i) => pool[(start + i) % pool.length]);
}
