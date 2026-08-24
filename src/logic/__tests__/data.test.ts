import { describe, expect, it } from 'vitest';
import {
  ALL_CAT15,
  ALL_CAT5,
  FOODS,
  SELECTABLE_FOODS,
  VISIBLE_FOODS,
  getFood,
  searchFoods,
  toHiragana,
} from '../../data/foods';

/** 一覧に出さない3件。データからは消さないので FOODS には残る */
const HIDDEN = ['いぬにく', 'くじらにく', 'はとにく'];

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
    // 438 -(非表示3 + 参照のみ5)
    expect(SELECTABLE_FOODS.length).toBe(430);
  });

  it('非表示の3件は一覧・検索に出ないが、ID からは引ける', () => {
    expect(FOODS.filter((f) => f.visible === false).map((f) => f.name).sort()).toEqual(
      [...HIDDEN].sort(),
    );
    expect(VISIBLE_FOODS.length).toBe(435);
    for (const name of HIDDEN) {
      const food = FOODS.find((f) => f.name === name)!;
      expect(VISIBLE_FOODS).not.toContain(food);
      expect(SELECTABLE_FOODS).not.toContain(food);
      // 名前で直接引いても出さない
      expect(searchFoods(name).map((f) => f.id)).not.toContain(food.id);
      // 保存済みの手帳・★が参照先を失わないよう、ID からは今までどおり引ける
      expect(getFood(food.id)).toBe(food);
    }
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

describe('別名 / 安全上の注意 / 退避したテキスト', () => {
  it('note は別名だけで、注意書きが混ざっていない', () => {
    for (const f of FOODS) {
      expect(f.note ?? '', `${f.name} の別名`).not.toContain('※');
    }
  });

  it('安全上の注意を持つのは食品安全の事実がある4件だけ', () => {
    expect(
      FOODS.filter((f) => (f.safety ?? '') !== '').map((f) => f.name).sort(),
    ).toEqual(['きんしんさい', 'ぎんなん', 'さんしょう(中国)', 'ふぐ'].sort());
  });

  it('退避したテキストは表示にも検索にも使わない', () => {
    // caution は中医学上の禁忌・注意・効能。医学上のエビデンスに乏しいので画面に出さない
    expect(FOODS.some((f) => (f.caution ?? '').includes('脾胃虚寒'))).toBe(true);
    expect(searchFoods('脾胃虚寒')).toEqual([]);
  });

  it('きじにくの「微毒」は退避したまま。安全上の注意には出さない', () => {
    // 「古書では」の伝聞で、確立した食品安全の事実とは言えない(2026-08-24 決定)
    const kiji = FOODS.find((f) => f.name === 'きじにく');
    expect(kiji?.caution ?? '').toContain('微毒');
    expect(kiji?.safety).toBeUndefined();
    expect(kiji?.note ?? '').not.toContain('微毒');
  });

  it('別名に戻した5件は退避側から消え、別名として引ける', () => {
    const RESTORED: [string, string][] = [
      ['むーるがい', 'ムラサキ貝'],
      ['まいかいか', 'はまなす'],
      ['あまざけ', '米麹'],
      ['ずいき', 'いもがら'],
      ['はぶちゃ', '決明子'],
    ];
    for (const [name, alias] of RESTORED) {
      const f = FOODS.find((x) => x.name === name);
      expect(f, name).toBeDefined();
      expect(f?.note ?? '', name).toContain(alias);
      expect(f?.caution, name).toBeUndefined();
      expect(searchFoods(alias).map((x) => x.name), alias).toContain(name);
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
