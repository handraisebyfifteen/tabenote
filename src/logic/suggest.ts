/**
 * 「補うなら」の食材候補(指示書 6-2)。
 *
 * 足りない味・足りない分類を埋める候補を提示する。
 * 「足りない食材の推奨は行う」(指示書 1章)の範囲であり、
 * 効能・症状には触れない。正解の押し付けもしない(候補の提示まで)。
 *
 * 並び順の方針: 使うほど自分用に最適化される(指示書 6-2)。
 *   1. お気に入り
 *   2. 選択回数の多いもの
 *   3. 季節の推奨の性に合うもの
 *   同点は参照データの掲載順。
 */
import { SELECTABLE_FOODS, type Cat5, type Food } from '../data/foods';
import { aggregateFlavors, missingFlavors, type FiveFlavor } from './flavors';
import { missingCats } from './coverage';
import { natureValue } from './nature';

export interface SuggestionContext {
  favorites: string[];
  /** foodId -> 選択回数 */
  selectionHistory: Record<string, number>;
  /** 季節の推奨の性レベル(SEASON_RECOMMENDATIONS.natureLevels) */
  seasonNatureLevels: number[];
}

export const EMPTY_SUGGESTION_CONTEXT: SuggestionContext = {
  favorites: [],
  selectionHistory: {},
  seasonNatureLevels: [],
};

/** 1項目あたりの候補数 */
export const SUGGESTION_LIMIT = 3;

export interface FlavorSuggestion {
  flavor: FiveFlavor;
  foods: Food[];
}

export interface CatSuggestion {
  cat: Cat5;
  foods: Food[];
}

export interface FillSuggestions {
  flavors: FlavorSuggestion[];
  cats: CatSuggestion[];
}

function score(food: Food, ctx: SuggestionContext): number {
  const favorite = ctx.favorites.includes(food.id) ? 1_000_000 : 0;
  const history = (ctx.selectionHistory[food.id] ?? 0) * 100;
  const season = ctx.seasonNatureLevels.includes(natureValue(food)) ? 1 : 0;
  return favorite + history + season;
}

function pick(
  pool: Food[],
  selectedIds: Set<string>,
  ctx: SuggestionContext,
): Food[] {
  return pool
    .filter((f) => !selectedIds.has(f.id))
    .map((f, i) => ({ f, s: score(f, ctx), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, SUGGESTION_LIMIT)
    .map((x) => x.f);
}

/** その味に寄与する食材(微・淡・渋の 0.5 寄与も含む) */
export function foodsWithFlavor(flavor: FiveFlavor): Food[] {
  return SELECTABLE_FOODS.filter((f) => aggregateFlavors([f])[flavor] > 0);
}

/**
 * 選択中の構成に足りない味・分類と、それを埋める候補。
 * 候補が1件もない項目は結果から落とす。
 */
export function fillSuggestions(
  selected: Food[],
  ctx: SuggestionContext,
): FillSuggestions {
  const selectedIds = new Set(selected.map((f) => f.id));
  const totals = aggregateFlavors(selected);

  const flavors: FlavorSuggestion[] = missingFlavors(totals)
    .map((flavor) => ({
      flavor,
      foods: pick(foodsWithFlavor(flavor), selectedIds, ctx),
    }))
    .filter((s) => s.foods.length > 0);

  const cats: CatSuggestion[] = missingCats(selected)
    .map((cat) => ({
      cat,
      foods: pick(
        SELECTABLE_FOODS.filter((f) => f.cat5 === cat),
        selectedIds,
        ctx,
      ),
    }))
    .filter((s) => s.foods.length > 0);

  return { flavors, cats };
}
