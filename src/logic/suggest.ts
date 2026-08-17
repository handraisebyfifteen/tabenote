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
import { adviceMissingCats, missingCats } from './coverage';
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
  page: number,
): Food[] {
  const ranked = pool
    .filter((f) => !selectedIds.has(f.id))
    .map((f, i) => ({ f, s: score(f, ctx), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.f);
  if (ranked.length <= SUGGESTION_LIMIT) return ranked;
  // 「ほかの候補」: ページごとに順位順の窓をずらし、末尾まで来たら先頭に巻き戻す
  const start = (page * SUGGESTION_LIMIT) % ranked.length;
  return Array.from(
    { length: SUGGESTION_LIMIT },
    (_, k) => ranked[(start + k) % ranked.length],
  );
}

/** その味に寄与する食材(微・淡・渋の 0.5 寄与も含む) */
export function foodsWithFlavor(flavor: FiveFlavor): Food[] {
  return SELECTABLE_FOODS.filter((f) => aggregateFlavors([f])[flavor] > 0);
}

/**
 * キャラ選択グリッドの「リフレッシュ」並び(指示書 6-2 の発展)。
 *
 * 選択が進むたびに残りの食材を並べ替え、次に選ぶと構成が広がるものを
 * 前に出す(例: 穀類を選んだら他の穀類は沈み、野菜や肉が前に来る)。
 *   1. まだ入っていない5分類を埋めるもの
 *   2. まだ入っていない味を埋めるもの
 *   3. 同点内は fillSuggestions と同じ個人化(★・履歴・季節)、最後は掲載順
 * 選択済みは結果に含めない。選択が空なら掲載順のまま返す。
 */
export function complementOrder(
  selected: Food[],
  ctx: SuggestionContext,
): Food[] {
  if (selected.length === 0) return SELECTABLE_FOODS;
  const selectedIds = new Set(selected.map((f) => f.id));
  const totals = aggregateFlavors(selected);
  const needFlavors = missingFlavors(totals);
  const needCats = new Set(missingCats(selected));

  return SELECTABLE_FOODS.filter((f) => !selectedIds.has(f.id))
    .map((f, i) => {
      const own = aggregateFlavors([f]);
      const fillsCat = needCats.has(f.cat5) ? 4 : 0;
      const fillsFlavor = needFlavors.some((fl) => own[fl] > 0) ? 2 : 0;
      // 補完の段(0/2/4/6)を最上位に、段内は score で個人化
      return { f, i, s: (fillsCat + fillsFlavor) * 1_000_000_000 + score(f, ctx) };
    })
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.f);
}

/**
 * 選択中の構成に足りない味・分類と、それを埋める候補。
 * 候補が1件もない項目は結果から落とす。
 * 分類は調味料・飲み物を除いた主な4分類だけを見る(coverage.adviceMissingCats)。
 * page は「ほかの候補」ボタン用。増やすたびに順位順の次の窓を返す。
 */
export function fillSuggestions(
  selected: Food[],
  ctx: SuggestionContext,
  page = 0,
): FillSuggestions {
  const selectedIds = new Set(selected.map((f) => f.id));
  const totals = aggregateFlavors(selected);

  const flavors: FlavorSuggestion[] = missingFlavors(totals)
    .map((flavor) => ({
      flavor,
      foods: pick(foodsWithFlavor(flavor), selectedIds, ctx, page),
    }))
    .filter((s) => s.foods.length > 0);

  const cats: CatSuggestion[] = adviceMissingCats(selected)
    .map((cat) => ({
      cat,
      foods: pick(
        SELECTABLE_FOODS.filter((f) => f.cat5 === cat),
        selectedIds,
        ctx,
        page,
      ),
    }))
    .filter((s) => s.foods.length > 0);

  return { flavors, cats };
}
