/**
 * 二十四節気の計算のテスト。
 * 期待値は solar_terms.md(2026年の期間表)に合わせている。
 * テストは日本時間(TZ=Asia/Tokyo)で実行すること(package.json の test スクリプトで指定済み)。
 */
import { describe, expect, it } from 'vitest';
import { SOLAR_TERMS, getCurrentTerm, termInstant, toCalendarDate } from '../solarTerms';

function findTerm(kanji: string) {
  const term = SOLAR_TERMS.find((t) => t.kanji === kanji);
  if (!term) throw new Error(`節気が見つかりません: ${kanji}`);
  return term;
}

function jstDate(year: number, kanji: string): string {
  const d = toCalendarDate(termInstant(year, findTerm(kanji)));
  return `${d.year}-${d.month}-${d.day}`;
}

describe('二十四節気の日付(太陽黄経から算出)', () => {
  it('2026年の四立が solar_terms.md の期間表と一致する', () => {
    expect(jstDate(2026, '立春')).toBe('2026-2-4'); // 春 2/4〜
    expect(jstDate(2026, '立夏')).toBe('2026-5-5'); // 夏 5/5〜
    expect(jstDate(2026, '立秋')).toBe('2026-8-7'); // 秋 8/7〜
    expect(jstDate(2026, '立冬')).toBe('2026-11-7'); // 冬 11/7〜
  });

  it('前後の年の立春も正しい(2025は2/3、2027は2/4)', () => {
    expect(jstDate(2025, '立春')).toBe('2025-2-3');
    expect(jstDate(2027, '立春')).toBe('2027-2-4');
  });

  it('分点・至点も正しい(2026)', () => {
    expect(jstDate(2026, '春分')).toBe('2026-3-20');
    expect(jstDate(2026, '夏至')).toBe('2026-6-21');
    expect(jstDate(2026, '秋分')).toBe('2026-9-23');
    expect(jstDate(2026, '冬至')).toBe('2026-12-22');
  });
});

describe('今日の節気の判定', () => {
  it('2026-08-16 は立秋の期間(次は処暑まで7日)', () => {
    const info = getCurrentTerm(new Date(2026, 7, 16));
    expect(info.current.term.kanji).toBe('立秋');
    expect(info.next.term.kanji).toBe('処暑');
    expect(info.daysUntilNext).toBe(7);
  });

  it('節気の初日はその節気になる(2026-08-07 → 立秋)', () => {
    const info = getCurrentTerm(new Date(2026, 7, 7));
    expect(info.current.term.kanji).toBe('立秋');
  });

  it('年またぎでも動く(2027-01-01 → 冬至の期間)', () => {
    const info = getCurrentTerm(new Date(2027, 0, 1));
    expect(info.current.term.kanji).toBe('冬至');
    expect(info.next.term.kanji).toBe('小寒');
  });
});
