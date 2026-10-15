import { describe, expect, it } from 'vitest';
import { SELECTABLE_FOODS } from '../../data/foods';
import { findOppositePair } from '../opposites';
import { food } from './helpers';

const byName = (name: string) => {
  const f = SELECTABLE_FOODS.find((x) => x.name === name);
  if (f === undefined) throw new Error(`図鑑に無い: ${name}`);
  return f;
};

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

describe('調味料がからむ釣り合い', () => {
  const shio = () => food({ id: 'shio', nature: '寒', cat15: 'choumi', cat5: 'season' });
  const kosho = () => food({ id: 'kosho', nature: '熱', cat15: 'choumi', cat5: 'season' });

  it('調味料どうしは involvesSeasoning が立つ', () => {
    const pair = findOppositePair([shio(), kosho()]);
    expect(pair).not.toBeNull();
    expect(pair!.involvesSeasoning).toBe(true);
  });

  it('片方だけが調味料でも involvesSeasoning が立つ', () => {
    const pair = findOppositePair([
      food({ id: 'hitsuji', nature: '熱', cat5: 'protein' }),
      shio(),
    ]);
    expect(pair!.involvesSeasoning).toBe(true);
  });

  it('主材料どうしのペアを優先する(差が小さくても)', () => {
    // カツオ(温+1)×スイカ(寒-2) = 差3 と
    // しお(寒-2)×こしょう(熱+2) = 差4 が同時にある場面
    const pair = findOppositePair([
      food({ id: 'katsuo', nature: '温', cat5: 'protein' }),
      food({ id: 'suika', nature: '寒', cat5: 'fruit' }),
      shio(),
      kosho(),
    ]);
    expect(pair!.involvesSeasoning).toBe(false);
    expect([pair!.a.id, pair!.b.id].sort()).toEqual(['katsuo', 'suika']);
    expect(pair!.diff).toBe(3);
  });

  it('主材料どうしで正反対が無ければ調味料のペアを返す', () => {
    const pair = findOppositePair([
      food({ id: 'kome', nature: '平', cat5: 'grain' }),
      shio(),
      kosho(),
    ]);
    expect(pair!.involvesSeasoning).toBe(true);
    expect(pair!.diff).toBe(4);
  });

  it('実データ: 当たり前の調味で「同じ皿に向かない」を出さない', () => {
    for (const names of [
      ['しお', 'こしょう'],
      ['しお', 'とうがらし'],
      ['しょうゆ', 'しょうが'],
    ]) {
      const pair = findOppositePair(names.map(byName));
      expect(pair, names.join('+')).not.toBeNull();
      expect(pair!.involvesSeasoning, names.join('+')).toBe(true);
    }
  });

  it('実データ: 設計書 3-8 のカツオ×スイカは従来どおり主材料の指摘', () => {
    const pair = findOppositePair([byName('かつお'), byName('すいか')]);
    expect(pair).not.toBeNull();
    expect(pair!.involvesSeasoning).toBe(false);
  });
});
