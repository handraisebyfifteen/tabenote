/** デモ仕様書 v2 §2 の実測値表と bar()/beat() が一致することの検算 */
import { describe, expect, it } from 'vitest';

import { bar, beat } from '../timing';

describe('demo timing', () => {
  it('小節頭の実測値表と一致する', () => {
    const table: [number, number][] = [
      [1, 0],
      [4, 5854],
      [9, 15610],
      [17, 31220],
      [24, 44878],
      [25, 46829],
      [27, 50732],
      [31, 58537],
      [37, 70244],
      [41, 78049],
      [43, 81951],
      [49, 93659],
      [51, 97561],
    ];
    for (const [n, ms] of table) {
      expect(bar(n), `bar(${n})`).toBe(ms);
    }
  });

  it('拍の位置(台本で使う点)が仕様書どおり', () => {
    expect(beat(2, 2)).toBe(2439); // スプラッシュ → Home
    expect(beat(11, 3)).toBe(20488); // 決定(1回目)
    expect(beat(23, 3)).toBe(43902); // 決定(2回目)。24小節頭の 976ms 手前
    expect(bar(24) - beat(23, 3)).toBe(976);
  });
});
