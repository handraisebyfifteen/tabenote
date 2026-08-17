/**
 * 表示翻訳(i18n/terms)がデータ全件を取りこぼさないことの検査。
 */
import { describe, expect, it } from 'vitest';
import { FOODS, SELECTABLE_FOODS } from '../../data/foods';
import { FOOD_NAMES_EN } from '../../data/foodNamesEn';
import {
  cat15Label,
  cat5Label,
  flavorsLabel,
  isKnownMeridianToken,
  meridiansLabel,
  natureLabel,
} from '../../i18n/terms';
import { getStrings } from '../../i18n/strings';

const hasJapanese = (s: string) => /[぀-ヿ㐀-鿿]/.test(s);

describe('術語の英訳', () => {
  it('全食材の帰経トークンが翻訳表にある', () => {
    for (const food of FOODS) {
      for (const token of food.meridians.split('・')) {
        expect(isKnownMeridianToken(token), `${food.name}: ${token}`).toBe(true);
      }
    }
  });

  it('全食材の性・味・分類が英語で表示できる(日本語の文字が残らない)', () => {
    for (const food of SELECTABLE_FOODS) {
      expect(hasJapanese(natureLabel(food.nature as never, 'en')), food.name).toBe(false);
      expect(hasJapanese(flavorsLabel(food.flavors, 'en')), food.name).toBe(false);
      expect(hasJapanese(meridiansLabel(food.meridians, 'en')), food.name).toBe(false);
      expect(hasJapanese(cat15Label(food.cat15, 'en')), food.name).toBe(false);
      expect(hasJapanese(cat5Label(food.cat5, 'en')), food.name).toBe(false);
    }
  });

  it('全438品目に英語名の下訳がある(日本語の文字が残らない)', () => {
    for (const food of FOODS) {
      const en = FOOD_NAMES_EN[food.id];
      expect(en, `${food.id} ${food.name}`).toBeTruthy();
      expect(hasJapanese(en), `${food.name} → ${en}`).toBe(false);
    }
  });

  it('英語名テーブルに余分なIDがない', () => {
    const known = new Set(FOODS.map((f) => f.id));
    for (const id of Object.keys(FOOD_NAMES_EN)) {
      expect(known.has(id), id).toBe(true);
    }
  });
});

describe('画面文字列', () => {
  it('日英で同じ形の五行表を持つ(行数・列数)', () => {
    const ja = getStrings('ja').guide.fivePhasesTable;
    const en = getStrings('en').guide.fivePhasesTable;
    expect(en.length).toBe(ja.length);
    for (let i = 0; i < ja.length; i++) {
      expect(en[i].length, `row ${i}`).toBe(ja[i].length);
    }
  });

  it('文生成関数が両言語で空にならない', () => {
    for (const lang of ['ja', 'en'] as const) {
      const t = getStrings(lang);
      expect(t.home.dateLabel(new Date(2026, 7, 16))).not.toBe('');
      expect(t.advice.flavorFact(['甘'], ['酸'])).not.toBe('');
      expect(t.advice.categoryFact([])).not.toBe('');
      expect(t.advice.categoryFact(['veg'])).not.toBe('');
      expect(t.combine.decide(2)).not.toBe('');
      expect(t.notebook.deleteMessage('x')).not.toBe('');
    }
  });
});
