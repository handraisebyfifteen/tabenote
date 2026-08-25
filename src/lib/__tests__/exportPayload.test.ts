/**
 * 書き出しデータの組み立てのテスト。
 * 「本人が作ったもの+表示名だけを出し、図鑑の分類データは絶対に出さない」
 * (2026-08-25 決定)の検証が中心。
 */
import { describe, expect, it } from 'vitest';

import { SELECTABLE_FOODS } from '../../data/foods';
import { FOOD_NAMES_EN } from '../../data/foodNamesEn';
import { foodName } from '../../i18n/terms';
import { buildExportPayload, exportFileName } from '../exportPayload';
import { EMPTY_USER_DATA, type UserData } from '../storage';

const FOOD = SELECTABLE_FOODS[0];
const AT = '2026-08-25T00:00:00.000Z';

function sample(): UserData {
  return {
    favorites: [FOOD.id],
    notes: { [FOOD.id]: '朝に食べた' },
    savedCombos: [
      {
        id: 'combo-1',
        name: '8/17の組み合わせ',
        foodIds: [FOOD.id, 'no-such-id'],
        memo: 'メモ',
        date: '2026-08-17',
      },
    ],
    selectionHistory: { [FOOD.id]: 3 },
    estimatedNotes: {
      らかんか: {
        name: 'らかんか',
        estimate: '推定',
        basis: '根拠',
        disclaimer: '免責',
      },
    },
  };
}

describe('buildExportPayload', () => {
  it('IDに表示名を並記する(ja)', () => {
    const p = buildExportPayload(sample(), 'ja', AT);
    expect(p.format).toBe(2);
    expect(p.notes).toEqual([{ id: FOOD.id, name: FOOD.name, memo: '朝に食べた' }]);
    expect(p.favorites).toEqual([{ id: FOOD.id, name: FOOD.name }]);
    expect(p.savedCombos[0].foods[0]).toEqual({ id: FOOD.id, name: FOOD.name });
    expect(p.selectionHistory).toEqual([{ id: FOOD.id, name: FOOD.name, count: 3 }]);
  });

  it('enでは図鑑の英語表示名を使う', () => {
    const p = buildExportPayload(sample(), 'en', AT);
    expect(p.favorites[0].name).toBe(foodName(FOOD, 'en'));
    // 英語名データが存在する食材なら日本語名と異なるはず
    if (FOOD_NAMES_EN[FOOD.id] !== undefined) {
      expect(p.favorites[0].name).toBe(FOOD_NAMES_EN[FOOD.id]);
    }
  });

  it('図鑑に無いID(壊れたデータ)はIDをそのまま出す', () => {
    const p = buildExportPayload(sample(), 'ja', AT);
    expect(p.savedCombos[0].foods[1]).toEqual({ id: 'no-such-id', name: 'no-such-id' });
  });

  it('図鑑の分類データ(性・五味・帰経・カテゴリ)を一切含めない', () => {
    const json = JSON.stringify(buildExportPayload(sample(), 'ja', AT));
    for (const key of ['"nature"', '"flavors"', '"meridians"', '"cat15"', '"cat5"']) {
      expect(json).not.toContain(key);
    }
    // 値としても混入しない(選んだ食材の性が値に出ていたら失敗)
    expect(json).not.toContain(`"${FOOD.nature}"`);
  });

  it('保存データの本体(メモ・組み合わせのメモと日付)を欠落させない', () => {
    const d = sample();
    const p = buildExportPayload(d, 'ja', AT);
    expect(p.savedCombos[0]).toMatchObject({
      id: 'combo-1',
      name: '8/17の組み合わせ',
      memo: 'メモ',
      date: '2026-08-17',
    });
    expect(p.estimatedNotes).toEqual(d.estimatedNotes);
    expect(p.exportedAt).toBe(AT);
    expect(p.lang).toBe('ja');
  });

  it('空データでも壊れない', () => {
    const p = buildExportPayload({ ...EMPTY_USER_DATA }, 'ja', AT);
    expect(p.notes).toEqual([]);
    expect(p.favorites).toEqual([]);
    expect(p.savedCombos).toEqual([]);
  });
});

describe('exportFileName', () => {
  it('ローカル日付で tabenote-YYYY-MM-DD.json を作る', () => {
    expect(exportFileName(new Date(2026, 7, 25))).toBe('tabenote-2026-08-25.json');
    expect(exportFileName(new Date(2026, 0, 5))).toBe('tabenote-2026-01-05.json');
  });
});
