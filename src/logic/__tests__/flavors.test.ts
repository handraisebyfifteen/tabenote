import { describe, expect, it } from 'vitest';
import { aggregateFlavors, dominantFlavors, missingFlavors } from '../flavors';
import { food } from './helpers';

describe('五味の集計(指示書 5-1)', () => {
  it('酸/苦/甘/辛/鹹 は 1.0 加算', () => {
    const totals = aggregateFlavors([
      food({ flavors: ['酸', '苦'] }),
      food({ flavors: ['甘', '辛', '鹹'] }),
    ]);
    expect(totals).toEqual({ 酸: 1, 苦: 1, 甘: 1, 辛: 1, 鹹: 1 });
  });

  it('微酸/微苦/微甘 は 0.5 加算', () => {
    const totals = aggregateFlavors([food({ flavors: ['微酸', '微苦', '微甘'] })]);
    expect(totals).toEqual({ 酸: 0.5, 苦: 0.5, 甘: 0.5, 辛: 0, 鹹: 0 });
  });

  it('淡は甘に 0.5、渋は酸に 0.5', () => {
    const totals = aggregateFlavors([food({ flavors: ['淡', '渋'] })]);
    expect(totals).toEqual({ 酸: 0.5, 苦: 0, 甘: 0.5, 辛: 0, 鹹: 0 });
  });

  it('複数食材で合算される(甘 1.0 + 微甘 0.5 + 淡 0.5 = 2.0)', () => {
    const totals = aggregateFlavors([
      food({ flavors: ['甘'] }),
      food({ flavors: ['微甘'] }),
      food({ flavors: ['淡'] }),
    ]);
    expect(totals.甘).toBe(2);
  });

  it('入っていない味を列挙できる', () => {
    const totals = aggregateFlavors([food({ flavors: ['甘', '辛'] })]);
    expect(missingFlavors(totals)).toEqual(['酸', '苦', '鹹']);
  });

  it('最も強い味を出せる(同率は複数)', () => {
    const totals = aggregateFlavors([
      food({ flavors: ['甘'] }),
      food({ flavors: ['甘', '辛'] }),
      food({ flavors: ['辛'] }),
    ]);
    expect(dominantFlavors(totals)).toEqual(['甘', '辛']);
    expect(dominantFlavors(aggregateFlavors([]))).toEqual([]);
  });
});
