/**
 * データ側の術語(性・味・帰経・分類・五季)の表示翻訳。
 *
 * 参照データそのものは日本語のまま(翻訳はしない)。ここは表示の変換だけを持つ。
 * 英語では "Liver" 等の臓器名を使うため、ライブラリー層の
 * 「五臓六腑は臓器ではない」の注記(指示書 6-3)と必ずセットで運用する。
 */
import type { Cat15, Cat5, Flavor, Food, Nature } from '../data/foods';
import { CAT15_LABELS, CAT5_LABELS } from '../data/foods';
import { FOOD_NAMES_EN } from '../data/foodNamesEn';
import { FIVE_FLAVORS, type FiveFlavor } from '../logic/flavors';
import type { FiveSeason, FiveSeasonInfo } from '../logic/season';
import { SEASON_RECOMMENDATIONS, fiveSeasonLabel } from '../logic/season';

export type Lang = 'ja' | 'en';

/* ---------------- 食材名 ---------------- */

/** 食材の表示名。英語名は AI下訳(レビュー待ち)。未整備の項目は日本語名のまま */
export function foodName(food: Food, lang: Lang): string {
  if (lang === 'en') return FOOD_NAMES_EN[food.id] ?? food.name;
  return food.name;
}

/** 食材名の列挙(ja: 「・」区切り / en: 「, 」区切り) */
export function joinFoodNames(foods: Food[], lang: Lang): string {
  return foods.map((f) => foodName(f, lang)).join(lang === 'ja' ? '・' : ', ');
}

/* ---------------- 性 ---------------- */

const NATURE_EN: Record<Exclude<Nature, ''>, string> = {
  熱: 'Hot',
  温: 'Warming',
  微温: 'Slightly warming',
  平: 'Neutral',
  涼: 'Cooling',
  微涼: 'Slightly cooling',
  寒: 'Cold',
  微寒: 'Slightly cold',
};

export function natureLabel(nature: Exclude<Nature, ''>, lang: Lang): string {
  return lang === 'ja' ? nature : NATURE_EN[nature];
}

/* ---------------- 味 ---------------- */

const FIVE_FLAVOR_EN: Record<FiveFlavor, string> = {
  酸: 'Sour',
  苦: 'Bitter',
  甘: 'Sweet',
  辛: 'Pungent',
  鹹: 'Salty',
};

export function fiveFlavorLabel(flavor: FiveFlavor, lang: Lang): string {
  return lang === 'ja' ? flavor : FIVE_FLAVOR_EN[flavor];
}

/** 五角形の軸ラベル(ja は漢字既定のままにするため undefined) */
export function fiveFlavorAxisLabels(
  lang: Lang,
): [string, string, string, string, string] | undefined {
  if (lang === 'ja') return undefined;
  return FIVE_FLAVORS.map((f) => FIVE_FLAVOR_EN[f]) as [
    string, string, string, string, string,
  ];
}

const FLAVOR_EN: Record<Flavor, string> = {
  酸: 'sour',
  苦: 'bitter',
  甘: 'sweet',
  辛: 'pungent',
  鹹: 'salty',
  淡: 'bland',
  渋: 'astringent',
  微酸: 'slightly sour',
  微苦: 'slightly bitter',
  微甘: 'slightly sweet',
};

/** 食材の味リストの表示(ja: 酸・微甘 / en: sour, slightly sweet) */
export function flavorsLabel(flavors: Flavor[], lang: Lang): string {
  if (lang === 'ja') return flavors.join('・');
  return flavors.map((f) => FLAVOR_EN[f]).join(', ');
}

/* ---------------- 帰経 ---------------- */

const MERIDIAN_EN: Record<string, string> = {
  肝: 'Liver',
  心: 'Heart',
  脾: 'Spleen',
  肺: 'Lung',
  腎: 'Kidney',
  胆: 'Gallbladder',
  胃: 'Stomach',
  大腸: 'Large Intestine',
  小腸: 'Small Intestine',
  膀胱: 'Bladder',
  三焦: 'Triple Burner',
  腸: 'Intestines',
};

/** 帰経の表示。「・」区切りの参照データをそのまま/英訳して返す */
export function meridiansLabel(meridians: string, lang: Lang): string {
  if (lang === 'ja' || meridians === '') return meridians;
  return meridians
    .split('・')
    .map((token) => MERIDIAN_EN[token] ?? token)
    .join(', ');
}

/** データ中の帰経トークンが翻訳表に揃っているかの検査用 */
export function isKnownMeridianToken(token: string): boolean {
  return token === '' || token in MERIDIAN_EN;
}

/* ---------------- 五臓 ---------------- */

const ORGAN_EN: Record<string, string> = {
  肝: 'Liver',
  心: 'Heart',
  脾: 'Spleen',
  肺: 'Lung',
  腎: 'Kidney',
};

export function organLabel(organJa: string, lang: Lang): string {
  return lang === 'ja' ? organJa : (ORGAN_EN[organJa] ?? organJa);
}

/* ---------------- 分類 ---------------- */

const CAT15_EN: Record<Cat15, string> = {
  kokurui: 'Grains',
  mame: 'Beans',
  imo: 'Tubers',
  shujitsu: 'Nuts & Seeds',
  yasai: 'Vegetables',
  kajitsu: 'Fruits',
  gyokai: 'Seafood',
  niku: 'Meat',
  tamago: 'Eggs',
  nyuu: 'Dairy',
  yushi: 'Oils',
  satou: 'Sugars',
  choumi: 'Seasonings',
  inryou: 'Beverages',
  alcohol: 'Alcohol',
};

const CAT5_EN: Record<Cat5, string> = {
  grain: 'Grains & Beans',
  veg: 'Vegetables',
  fruit: 'Fruits',
  protein: 'Meat & Fish',
  season: 'Seasonings & Drinks',
};

export function cat15Label(cat: Cat15, lang: Lang): string {
  return lang === 'ja' ? CAT15_LABELS[cat] : CAT15_EN[cat];
}

export function cat5Label(cat: Cat5, lang: Lang): string {
  return lang === 'ja' ? CAT5_LABELS[cat] : CAT5_EN[cat];
}

/* ---------------- 五季 ---------------- */

const FOUR_SEASON_EN: Record<Exclude<FiveSeason, 'doyo'>, string> = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
};

export function fiveSeasonName(info: FiveSeasonInfo, lang: Lang): string {
  if (lang === 'ja') return fiveSeasonLabel(info);
  if (info.season === 'doyo' && info.doyoParent) {
    return `Long Summer (${FOUR_SEASON_EN[info.doyoParent].toLowerCase()} doyō)`;
  }
  return FOUR_SEASON_EN[info.season as Exclude<FiveSeason, 'doyo'>];
}

/** 季節の推奨の性の言い方(ja は season.ts の natureText をそのまま使う) */
const SEASON_NATURE_EN: Record<FiveSeason, string> = {
  spring: 'warming / cooling',
  summer: 'cold / cooling',
  doyo: 'neutral / warming / cooling',
  autumn: 'warm-dry or cool-dry, as the weather asks',
  winter: 'warming / hot',
};

export function seasonNatureText(season: FiveSeason, lang: Lang): string {
  return lang === 'ja'
    ? SEASON_RECOMMENDATIONS[season].natureText
    : SEASON_NATURE_EN[season];
}
