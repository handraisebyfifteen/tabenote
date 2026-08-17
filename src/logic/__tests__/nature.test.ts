import { describe, expect, it } from 'vitest';
import { averageNatureLevel, natureValue } from '../nature';
import { food } from './helpers';

describe('性(寒熱)の集計(指示書 5-2)', () => {
  it('熱+2 / 温・微温+1 / 平0 / 涼・微涼-1 / 寒・微寒-2', () => {
    expect(natureValue(food({ nature: '熱' }))).toBe(2);
    expect(natureValue(food({ nature: '温' }))).toBe(1);
    expect(natureValue(food({ nature: '微温' }))).toBe(1);
    expect(natureValue(food({ nature: '平' }))).toBe(0);
    expect(natureValue(food({ nature: '涼' }))).toBe(-1);
    expect(natureValue(food({ nature: '微涼' }))).toBe(-1);
    expect(natureValue(food({ nature: '寒' }))).toBe(-2);
    expect(natureValue(food({ nature: '微寒' }))).toBe(-2);
  });

  it('平均を四捨五入して -2〜+2 の5段階にする', () => {
    // (2 + 1) / 2 = 1.5 → 2
    expect(averageNatureLevel([food({ nature: '熱' }), food({ nature: '温' })])).toBe(2);
    // (1 + 0) / 2 = 0.5 → 1
    expect(averageNatureLevel([food({ nature: '温' }), food({ nature: '平' })])).toBe(1);
    // (-1 + 0) / 2 = -0.5 → -1(0側に丸めない)
    expect(averageNatureLevel([food({ nature: '涼' }), food({ nature: '平' })])).toBe(-1);
    // (2 - 2) / 2 = 0
    expect(averageNatureLevel([food({ nature: '熱' }), food({ nature: '寒' })])).toBe(0);
  });

  it('食材が空なら null(表示なし)', () => {
    expect(averageNatureLevel([])).toBeNull();
  });

  it('参照のみ項目を渡すとエラーになる', () => {
    expect(() => natureValue(food({ nature: '' }))).toThrow();
  });
});
