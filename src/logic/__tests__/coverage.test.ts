import { describe, expect, it } from 'vitest';
import { coveredCats, missingCats } from '../coverage';
import { food } from './helpers';

describe('5大分類の網羅性(指示書 5-3)', () => {
  it('含まれる分類と含まれない分類を出せる', () => {
    const selection = [
      food({ cat5: 'veg' }),
      food({ cat5: 'protein' }),
      food({ cat5: 'veg' }),
    ];
    expect(coveredCats(selection)).toEqual(['veg', 'protein']);
    expect(missingCats(selection)).toEqual(['grain', 'fruit', 'season']);
  });

  it('空選択ではすべて欠けている', () => {
    expect(missingCats([])).toEqual(['grain', 'veg', 'fruit', 'protein', 'season']);
  });
});
