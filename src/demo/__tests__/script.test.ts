/**
 * 台本の組み立てが崩れていないことの検算。
 *
 * 撮影は実機でしか確かめられないので、時刻の並びだけでも固定しておく。
 * 特に「準備はスプラッシュの内側で終わる」は、初回テイクで reset が
 * 空振りすると1テイム目の頭が違う画になるため、ここで押さえる。
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-router', () => ({
  router: { navigate: () => {}, back: () => {}, canGoBack: () => false },
}));

const { buildDemoActions, COUNT_IN_MS } = await import('../script');
const { bar, beat } = await import('../timing');

const actions = buildDemoActions();
/**
 * 準備フェーズ。カウントイン明け(0:00.00)を越えても、スプラッシュが
 * 捌ける 4390ms までは画面が覆われているので、そこまでは準備に使ってよい。
 */
const prep = actions.filter((a) => a.label?.startsWith('(準備)'));

describe('demo script', () => {
  it('カウントインは1小節', () => {
    expect(COUNT_IN_MS).toBe(1951);
  });

  it('準備はスプラッシュが捌ける前に終わる', () => {
    // スプラッシュは押下 +(COUNT_IN_MS + beat(2,2)) まで画面を覆う
    const splashLift = COUNT_IN_MS + beat(2, 2);
    expect(splashLift).toBe(4390);
    const lastPrep = Math.max(...prep.map((a) => a.at));
    expect(lastPrep).toBeLessThan(splashLift);
    // 初回テイクのマウント待ちに余裕があること(1秒以上)
    expect(splashLift - lastPrep).toBeGreaterThanOrEqual(1000);
  });

  it('準備は マウント → 初期化 の順で、間隔が空いている', () => {
    const at = (label: string) => {
      const found = prep.find((a) => a.label?.includes(label));
      if (found === undefined) throw new Error(`準備アクションが無い: ${label}`);
      return found.at;
    };
    expect(at('組み合わせ画面をマウント')).toBeLessThan(at('組み合わせ画面を初期化'));
    expect(at('組み合わせ画面を初期化')).toBeLessThan(at('手帳をマウント'));
    expect(at('手帳をマウント')).toBeLessThan(at('手帳を初期化'));
    expect(at('手帳を初期化')).toBeLessThan(at('Home へ戻す'));
    // マウントから初期化まで、ハンドラ登録を待てるだけの間があること
    expect(at('組み合わせ画面を初期化') - at('組み合わせ画面をマウント')).toBeGreaterThanOrEqual(500);
    expect(at('手帳を初期化') - at('手帳をマウント')).toBeGreaterThanOrEqual(500);
  });

  it('本編の時刻は COUNT_IN_MS ぶんだけずれている(二重加算なし)', () => {
    const at = (label: string) => {
      const found = actions.find((a) => a.label?.includes(label));
      if (found === undefined) throw new Error(`アクションが無い: ${label}`);
      return found.at;
    };
    expect(at('Combination')).toBe(COUNT_IN_MS + bar(4));
    expect(at('決定(1回目')).toBe(COUNT_IN_MS + beat(11, 3));
    expect(at('決定(2回目')).toBe(COUNT_IN_MS + beat(23, 3));
    expect(at('encyclopedia')).toBe(COUNT_IN_MS + bar(31));
    expect(at('締めのスプラッシュ')).toBe(COUNT_IN_MS + bar(49));
  });

  it('時刻はすべて整数で、単調に並べられる', () => {
    for (const a of actions) {
      expect(Number.isInteger(a.at), `${a.label} の at が整数でない`).toBe(true);
      expect(a.at).toBeGreaterThanOrEqual(0);
    }
  });
});
