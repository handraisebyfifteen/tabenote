/**
 * 表示翻訳(i18n/terms)がデータ全件を取りこぼさないことの検査。
 */
import { describe, expect, it } from 'vitest';
import { FOODS, SELECTABLE_FOODS } from '../../data/foods';
import { FOOD_NAMES_EN } from '../../data/foodNamesEn';
import { FOOD_NOTES_EN, FOOD_SAFETY_EN } from '../../data/foodNotesEn';
import {
  cat15Label,
  cat5Label,
  flavorsLabel,
  foodAlias,
  foodSafety,
  isKnownMeridianToken,
  meridiansLabel,
  natureLabel,
} from '../../i18n/terms';
import { getStrings } from '../../i18n/strings';
import { pickLang } from '../../i18n/deviceLang';

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

  // 別名(note)は全件ぶんの英語版を持たない。漢字表記だけの項目は英語で出さないため、
  // 「全件あること」ではなく「出すときに日本語が混じらないこと」を担保する
  it('英語の別名に日本語の文字が残らない', () => {
    for (const food of FOODS) {
      const en = foodAlias(food, 'en');
      expect(hasJapanese(en), `${food.name} → ${en}`).toBe(false);
    }
  });

  it('別名テーブルに余分なIDがない', () => {
    const known = new Set(FOODS.map((f) => f.id));
    for (const id of Object.keys(FOOD_NOTES_EN)) {
      expect(known.has(id), id).toBe(true);
    }
    for (const id of Object.keys(FOOD_SAFETY_EN)) {
      expect(known.has(id), id).toBe(true);
    }
  });

  // 日本語の別名は出典どおり(足さない)。英語は別テーブルなので、
  // 日本語に別名が無くても英語の別名だけある食材はありうる(なまこ(乾) の trepang など)
  it('日本語の別名は出典の note をそのまま出す', () => {
    for (const food of FOODS) {
      expect(foodAlias(food, 'ja'), food.name).toBe(food.note);
    }
  });

  // 安全上の注意は隠せない情報なので、英訳の取りこぼしは許さない(全件必須)
  it('安全上の注意は全件英訳があり日本語が残らない', () => {
    for (const food of FOODS) {
      if (food.safety === undefined || food.safety === '') continue;
      const en = foodSafety(food, 'en');
      expect(en, `${food.id} ${food.name}`).toBeTruthy();
      expect(hasJapanese(en), `${food.name} → ${en}`).toBe(false);
    }
  });

  it('安全上の注意は日本語では出典どおりの文言のまま', () => {
    for (const food of FOODS) {
      expect(foodSafety(food, 'ja'), food.name).toBe(food.safety ?? '');
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

describe('既定の表示言語', () => {
  // 国外向けのアプリなので既定は英語。日本語端末のときだけ日本語で開く
  it('日本語端末だけ ja、それ以外はすべて en', () => {
    expect(pickLang([{ languageCode: 'ja' }])).toBe('ja');
    expect(pickLang([{ languageCode: 'ja-JP' }])).toBe('ja');
    expect(pickLang([{ languageCode: 'en' }])).toBe('en');
    expect(pickLang([{ languageCode: 'fr' }])).toBe('en');
    expect(pickLang([{ languageCode: 'zh-Hant' }])).toBe('en');
  });

  it('端末の第1言語だけを見る(第2言語が日本語でも英語のまま)', () => {
    expect(pickLang([{ languageCode: 'en' }, { languageCode: 'ja' }])).toBe('en');
    expect(pickLang([{ languageCode: 'ja' }, { languageCode: 'en' }])).toBe('ja');
  });

  it('端末の言語を取れないときは英語', () => {
    expect(pickLang([])).toBe('en');
    expect(pickLang(null)).toBe('en');
    expect(pickLang(undefined)).toBe('en');
    expect(pickLang([{ languageCode: null }])).toBe('en');
  });
});
