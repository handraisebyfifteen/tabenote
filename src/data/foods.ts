/**
 * 参照データ(tabenote_foods.json)の読み込み層。
 * このデータは読み取り専用。アプリからの書き込みは一切行わない(指示書 4-1)。
 */
import rawFoods from './tabenote_foods.json';
import { FOOD_NAMES_EN } from './foodNamesEn';
import { FOOD_NOTES_EN } from './foodNotesEn';

/** 性(四性+平)。空文字は「参照のみ項目」で選択不可(指示書 4-3) */
export type Nature = '熱' | '温' | '微温' | '平' | '微涼' | '涼' | '微寒' | '寒' | '';

/** 味。五味+淡・渋+「微」付き */
export type Flavor =
  | '酸' | '苦' | '甘' | '辛' | '鹹'
  | '淡' | '渋'
  | '微酸' | '微苦' | '微甘';

/** 15分類(探すためのタブ用) */
export type Cat15 =
  | 'kokurui' | 'mame' | 'imo' | 'shujitsu' | 'yasai'
  | 'kajitsu' | 'gyokai' | 'niku' | 'tamago' | 'nyuu'
  | 'yushi' | 'satou' | 'choumi' | 'inryou' | 'alcohol';

/** 5大分類(判定用) */
export type Cat5 = 'grain' | 'veg' | 'fruit' | 'protein' | 'season';

export interface Food {
  /** 固定ID。メモ・お気に入り等はこのIDに紐づくため絶対に変更しない */
  id: string;
  name: string;
  nature: Nature;
  flavors: Flavor[];
  meridians: string;
  cat15: Cat15;
  cat5: Cat5;
  /** 別名・漢字名(生物学上・言語上の事実のみ。中医学上の注意は持たない) */
  note: string;
  /**
   * 食品安全上の事実(ふぐの肝臓・卵巣、ぎんなんの小毒など)。中医学の禁忌ではない。
   * 別名とは別のラベルで表示する。持たない食材のほうが多い。
   */
  safety?: string;
  /**
   * 退避したテキスト。かつて note に「※」付きで同居していた中医学上の禁忌・注意・
   * 効能・性味の補足で、医学上のエビデンスに乏しいため画面には一切出さない。
   * 出典との対応を保つためデータからは消していない。表示・検索に使わないこと。
   */
  caution?: string;
  /** 出典書籍のページ番号 */
  page?: string;
  /** 食材ごとのアイコンキー(src/components/icons/icons.ts の ICONS を参照) */
  icon: string;
  /** カテゴリアイコンキー(フォールバック用) */
  catIcon: string;
  /**
   * false のときのみ存在。一覧・検索から除外する。
   * いぬにく・くじらにく・はとにくの3件。出典書籍には載っている項目なので
   * データからは消さない(消すと出典との対応が崩れ、ID を持つ既存の手帳・★も
   * 参照先を失う)。表に出さないだけにして、getFood では今までどおり引ける。
   */
  visible?: boolean;
}

/** 出典どおりの全438件(非表示3件・参照のみ5件を含む)。ID から引くときの母集合 */
export const FOODS = rawFoods as Food[];

/** 画面に出す食材(visible: false の3件を除く) */
export const VISIBLE_FOODS: Food[] = FOODS.filter((f) => f.visible !== false);

/** 選択可能な食材(さらに nature が空の「参照のみ項目」5件を除く) */
export const SELECTABLE_FOODS: Food[] = VISIBLE_FOODS.filter((f) => f.nature !== '');

const byId = new Map<string, Food>(FOODS.map((f) => [f.id, f]));

export function getFood(id: string): Food | undefined {
  return byId.get(id);
}

/** 参照のみ項目かどうか(選択不可。note の参照先を表示する) */
export function isReferenceOnly(food: Food): boolean {
  return food.nature === '';
}

export const CAT15_LABELS: Record<Cat15, string> = {
  kokurui: '穀類',
  mame: '豆',
  imo: 'いも',
  shujitsu: '種実',
  yasai: '野菜',
  kajitsu: '果実',
  gyokai: '魚介',
  niku: '肉',
  tamago: '卵',
  nyuu: '乳',
  yushi: '油脂',
  satou: '砂糖',
  choumi: '調味料',
  inryou: '飲料',
  alcohol: '酒',
};

export const CAT5_LABELS: Record<Cat5, string> = {
  grain: '穀類・豆',
  veg: '野菜',
  fruit: '果実',
  protein: '肉・魚',
  season: '調味料・飲み物',
};

export const ALL_CAT15: Cat15[] = [
  'kokurui', 'mame', 'imo', 'shujitsu', 'yasai',
  'kajitsu', 'gyokai', 'niku', 'tamago', 'nyuu',
  'yushi', 'satou', 'choumi', 'inryou', 'alcohol',
];

export const ALL_CAT5: Cat5[] = ['grain', 'veg', 'fruit', 'protein', 'season'];

/** カタカナをひらがなに揃える(五十音検索用) */
export function toHiragana(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}

/**
 * 名前・別名(note)・英語名に対する部分一致検索。
 * 非表示の食材は、名前で直接引かれても出さない。caution は表に出さないので検索もしない。
 */
export function searchFoods(query: string): Food[] {
  const q = toHiragana(query.trim().toLowerCase());
  if (q === '') return [];
  return VISIBLE_FOODS.filter((f) => {
    const name = toHiragana(f.name.toLowerCase());
    const note = toHiragana((f.note ?? '').toLowerCase());
    const en = (FOOD_NAMES_EN[f.id] ?? '').toLowerCase();
    const noteEn = (FOOD_NOTES_EN[f.id] ?? '').toLowerCase();
    return name.includes(q) || note.includes(q) || en.includes(q) || noteEn.includes(q);
  });
}
