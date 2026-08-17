import { describe, expect, it } from 'vitest';
import {
  ALL_CAT15,
  ALL_CAT5,
  FOODS,
  SELECTABLE_FOODS,
  searchFoods,
  toHiragana,
} from '../../data/foods';

describe('参照データ(tabenote_foods.json)', () => {
  it('438件ある', () => {
    expect(FOODS.length).toBe(438);
  });

  it('IDに重複がない', () => {
    const ids = new Set(FOODS.map((f) => f.id));
    expect(ids.size).toBe(438);
  });

  it('参照のみ項目(nature が空)は指定の5件', () => {
    const referenceOnly = FOODS.filter((f) => f.nature === '');
    expect(referenceOnly.map((f) => f.name).sort()).toEqual(
      ['かたくりこ', 'グリーンピース', 'しちめんちょう', 'パプリカ', 'ひらたけ'].sort(),
    );
    expect(SELECTABLE_FOODS.length).toBe(433);
  });

  it('nature / flavors / cat15 / cat5 がすべて定義済みの値', () => {
    const natures = new Set(['熱', '温', '微温', '平', '微涼', '涼', '微寒', '寒', '']);
    const flavors = new Set(['酸', '苦', '甘', '辛', '鹹', '淡', '渋', '微酸', '微苦', '微甘']);
    for (const f of FOODS) {
      expect(natures.has(f.nature), `${f.name} の性: ${f.nature}`).toBe(true);
      for (const fl of f.flavors) {
        expect(flavors.has(fl), `${f.name} の味: ${fl}`).toBe(true);
      }
      expect(ALL_CAT15).toContain(f.cat15);
      expect(ALL_CAT5).toContain(f.cat5);
    }
  });
});

describe('検索', () => {
  it('カタカナ・ひらがなの区別なく引ける', () => {
    expect(toHiragana('ショウガ')).toBe('しょうが');
    const a = searchFoods('しょうが');
    const b = searchFoods('ショウガ');
    expect(a.length).toBeGreaterThan(0);
    expect(a.map((f) => f.id)).toEqual(b.map((f) => f.id));
  });

  it('空文字では何も返さない', () => {
    expect(searchFoods('  ')).toEqual([]);
  });
});
