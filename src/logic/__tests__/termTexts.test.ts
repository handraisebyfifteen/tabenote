/**
 * 節気テキスト(solarTermTexts)の完全性チェック。
 * solar_terms.md の「段落2の推奨は五季の判定ロジックと一致させること」を機械的に確認する。
 */
import { describe, expect, it } from 'vitest';
import { SOLAR_TERM_TEXTS, getTermText } from '../../data/solarTermTexts';
import { SOLAR_TERMS } from '../solarTerms';

describe('節気テキストの完全性', () => {
  it('24節気すべてに日英2段落以上のテキストがある', () => {
    for (const term of SOLAR_TERMS) {
      const text = getTermText(term.kanji);
      expect(text, term.kanji).toBeDefined();
      expect(text!.ja.length, `${term.kanji} ja`).toBeGreaterThanOrEqual(2);
      expect(text!.en.length, `${term.kanji} en`).toBeGreaterThanOrEqual(2);
    }
  });

  it('テキストに余分なキーがない(節気名の打ち間違い検知)', () => {
    const known = new Set(SOLAR_TERMS.map((t) => t.kanji));
    for (const key of Object.keys(SOLAR_TERM_TEXTS)) {
      expect(known.has(key), key).toBe(true);
    }
  });

  it('四立の段落2は、その季節の五臓に言及している', () => {
    const organs: [string, string][] = [
      ['立春', '肝'],
      ['立夏', '心'],
      ['立秋', '肺'],
      ['立冬', '腎'],
    ];
    for (const [kanji, organ] of organs) {
      expect(getTermText(kanji)!.ja[1], kanji).toContain(organ);
    }
  });

  it('土用にあたる節気(穀雨・大暑・霜降・大寒)の段落2は脾に言及している', () => {
    for (const kanji of ['穀雨', '大暑', '霜降', '大寒']) {
      expect(getTermText(kanji)!.ja[1], kanji).toContain('脾');
    }
  });
});
