/**
 * ペイウォールの無料トライアル表記のテスト(2026-10-15 決定)。
 *
 * 同じ2週間のトライアルを App Store は WEEK/2、Google Play は DAY/14 で返す。
 * どちらでも同じ一行になること(「14日間」と「2週間」が混ざらないこと)を確かめる。
 */
import { describe, expect, it } from 'vitest';

import { getStrings } from '../strings';

const ja = getStrings('ja').paywall;
const en = getStrings('en').paywall;

describe('trialLead', () => {
  it('2週間と14日を同じ文にする', () => {
    expect(ja.trialLead({ count: 2, unit: 'WEEK' })).toBe('最初の2週間は無料');
    expect(ja.trialLead({ count: 14, unit: 'DAY' })).toBe('最初の2週間は無料');
    expect(en.trialLead({ count: 2, unit: 'WEEK' })).toBe('2 weeks free');
    expect(en.trialLead({ count: 14, unit: 'DAY' })).toBe('2 weeks free');
  });

  it('7日は1週間になり、英語は単数形になる', () => {
    expect(ja.trialLead({ count: 7, unit: 'DAY' })).toBe('最初の1週間は無料');
    expect(en.trialLead({ count: 7, unit: 'DAY' })).toBe('1 week free');
  });

  it('7の倍数でない日数と、週以外の単位はそのまま出す', () => {
    expect(ja.trialLead({ count: 10, unit: 'DAY' })).toBe('最初の10日間は無料');
    expect(en.trialLead({ count: 10, unit: 'DAY' })).toBe('10 days free');
    expect(ja.trialLead({ count: 1, unit: 'MONTH' })).toBe('最初の1か月は無料');
    expect(en.trialLead({ count: 1, unit: 'MONTH' })).toBe('1 month free');
  });
});

describe('trialNote(初回ゲート用。適格でない人にも出るので断定しない)', () => {
  it('条件を添えた言い方で、長さは trialLead と揃う', () => {
    expect(ja.trialNote({ count: 14, unit: 'DAY' })).toBe('初めてのご登録なら、最初の2週間は無料');
    expect(en.trialNote({ count: 2, unit: 'WEEK' })).toBe('New subscribers start with 2 weeks free');
  });
});
