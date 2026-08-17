import { describe, expect, it } from 'vitest';
import { findOppositePair } from '../opposites';
import { food } from './helpers';

describe('性が正反対の組み合わせの検知(指示書 5-4)', () => {
  it('熱(+2) × 寒(-2) は検知される(差4)', () => {
    const pair = findOppositePair([
      food({ id: 'a', nature: '熱' }),
      food({ id: 'b', nature: '寒' }),
    ]);
    expect(pair).not.toBeNull();
    expect(pair!.diff).toBe(4);
  });

  it('温(+1) × 寒(-2) も検知される(差3。設計書のカツオ×スイカの例)', () => {
    const pair = findOppositePair([
      food({ id: 'katsuo', nature: '温' }),
      food({ id: 'suika', nature: '寒' }),
    ]);
    expect(pair).not.toBeNull();
    expect(pair!.diff).toBe(3);
  });

  it('温(+1) × 涼(-1) は対象外(差2)', () => {
    expect(
      findOppositePair([food({ id: 'a', nature: '温' }), food({ id: 'b', nature: '涼' })]),
    ).toBeNull();
  });

  it('同符号・平のみでは検知されない', () => {
    expect(
      findOppositePair([food({ id: 'a', nature: '熱' }), food({ id: 'b', nature: '温' })]),
    ).toBeNull();
    expect(
      findOppositePair([food({ id: 'a', nature: '平' }), food({ id: 'b', nature: '平' })]),
    ).toBeNull();
  });

  it('複数ペアがあるときは差が最大のペアを返す', () => {
    const pair = findOppositePair([
      food({ id: 'atsui', nature: '熱' }),
      food({ id: 'nurui', nature: '温' }),
      food({ id: 'samui', nature: '寒' }),
    ]);
    expect(pair!.a.id).toBe('atsui');
    expect(pair!.b.id).toBe('samui');
    expect(pair!.diff).toBe(4);
  });
});
