/**
 * 五季(土用方式)のテスト。
 * 期待値は solar_terms.md の「五季 2026年の期間」の表そのもの。
 *
 *   春:        2/4〜4/16
 *   長夏(春土用): 4/17〜5/4
 *   夏:        5/5〜7/19
 *   長夏(夏土用): 7/20〜8/6
 *   秋:        8/7〜10/19
 *   長夏(秋土用): 10/20〜11/6
 *   冬:        11/7〜1/15
 *   長夏(冬土用): 1/16〜2/3
 */
import { describe, expect, it } from 'vitest';
import { fiveSeasonLabel, getFiveSeason } from '../season';

function seasonAt(y: number, m: number, d: number) {
  return getFiveSeason(new Date(y, m - 1, d));
}

describe('五季の判定(土用方式)', () => {
  it('春: 2/4〜4/16', () => {
    expect(seasonAt(2026, 2, 4).season).toBe('spring');
    expect(seasonAt(2026, 4, 16).season).toBe('spring');
  });

  it('春土用: 4/17〜5/4', () => {
    expect(seasonAt(2026, 4, 17)).toMatchObject({ season: 'doyo', doyoParent: 'spring' });
    expect(seasonAt(2026, 5, 4)).toMatchObject({ season: 'doyo', doyoParent: 'spring' });
  });

  it('夏: 5/5〜7/19', () => {
    expect(seasonAt(2026, 5, 5).season).toBe('summer');
    expect(seasonAt(2026, 7, 19).season).toBe('summer');
  });

  it('夏土用: 7/20〜8/6(大暑の日も夏土用と表示されるのは矛盾ではない)', () => {
    expect(seasonAt(2026, 7, 20)).toMatchObject({ season: 'doyo', doyoParent: 'summer' });
    expect(seasonAt(2026, 7, 23)).toMatchObject({ season: 'doyo', doyoParent: 'summer' }); // 大暑
    expect(seasonAt(2026, 8, 6)).toMatchObject({ season: 'doyo', doyoParent: 'summer' });
  });

  it('秋: 8/7〜10/19(今日 2026-08-16 は秋)', () => {
    expect(seasonAt(2026, 8, 7).season).toBe('autumn');
    expect(seasonAt(2026, 8, 16).season).toBe('autumn');
    expect(seasonAt(2026, 10, 19).season).toBe('autumn');
  });

  it('秋土用: 10/20〜11/6', () => {
    expect(seasonAt(2026, 10, 20)).toMatchObject({ season: 'doyo', doyoParent: 'autumn' });
    expect(seasonAt(2026, 11, 6)).toMatchObject({ season: 'doyo', doyoParent: 'autumn' });
  });

  it('冬: 11/7〜1/15(年またぎ)', () => {
    expect(seasonAt(2026, 11, 7).season).toBe('winter');
    expect(seasonAt(2027, 1, 15).season).toBe('winter');
  });

  it('冬土用: 1/17〜2/3、明けて立春から春', () => {
    // 注: solar_terms.md の期間表は「冬土用 1/16〜2/3」だが、これは19日間であり
    // 同資料のルール「土用 = 立春の直前18日間」と矛盾する(他の3つの土用は一致)。
    // ルールに従い 立春(2/4)の18日前 = 1/17 を土用入りとして実装している。
    // (伝統的な暦の冬土用入りも 1/17 頃であり、ルール側が正しいと判断)
    expect(seasonAt(2027, 1, 16).season).toBe('winter');
    expect(seasonAt(2027, 1, 17)).toMatchObject({ season: 'doyo', doyoParent: 'winter' });
    expect(seasonAt(2027, 2, 3)).toMatchObject({ season: 'doyo', doyoParent: 'winter' });
    expect(seasonAt(2027, 2, 4).season).toBe('spring');
  });

  it('表示ラベルと推奨(判定ロジックと一致させる)', () => {
    const doyo = seasonAt(2026, 7, 23);
    expect(fiveSeasonLabel(doyo)).toBe('長夏(夏土用)');
    expect(doyo.recommendation.flavors).toEqual(['甘', '苦']);
    expect(doyo.recommendation.organ).toBe('脾');

    const autumn = seasonAt(2026, 8, 16);
    expect(autumn.recommendation.flavors).toEqual(['辛', '甘']);
    expect(autumn.recommendation.organ).toBe('肺');
  });
});
