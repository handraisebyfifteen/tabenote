/**
 * ユーザーデータ保存層のテスト。
 * AsyncStorage はメモリ上のモックに差し替える。
 * 「壊れたデータでも参照データは無事なので致命傷にならない」設計の検証が中心。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: async (key: string) => {
        store.delete(key);
      },
      __reset: () => store.clear(),
    },
  };
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EMPTY_USER_DATA,
  addSavedCombo,
  deleteSavedCombo,
  loadUserData,
  recordSelections,
  setFoodNote,
  toggleFavorite,
  updateSavedCombo,
} from '../storage';

const STORAGE_KEY = 'tabenote/userdata/v1';

beforeEach(() => {
  (AsyncStorage as unknown as { __reset: () => void }).__reset();
});

describe('loadUserData', () => {
  it('何も保存されていなければ空データを返す', async () => {
    expect(await loadUserData()).toEqual(EMPTY_USER_DATA);
  });

  it('壊れたJSONなら空データに戻す', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '{{{not json');
    expect(await loadUserData()).toEqual(EMPTY_USER_DATA);
  });

  it('一部のフィールドだけ壊れていても、そのフィールドだけ空に戻す', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ favorites: 'おかしい値', notes: { rice: 'めも' } }),
    );
    const d = await loadUserData();
    expect(d.favorites).toEqual([]);
    expect(d.notes).toEqual({ rice: 'めも' });
  });
});

describe('お気に入りとメモ', () => {
  it('toggleFavorite は追加と解除を交互に行う', async () => {
    await toggleFavorite('shoga');
    expect((await loadUserData()).favorites).toEqual(['shoga']);
    await toggleFavorite('shoga');
    expect((await loadUserData()).favorites).toEqual([]);
  });

  it('setFoodNote は空文字でメモを削除する', async () => {
    await setFoodNote('shoga', '温める');
    expect((await loadUserData()).notes).toEqual({ shoga: '温める' });
    await setFoodNote('shoga', '   ');
    expect((await loadUserData()).notes).toEqual({});
  });
});

describe('保存した組み合わせ', () => {
  const combo = {
    id: 'combo-1',
    name: '8/16の組み合わせ',
    foodIds: ['a', 'b'],
    memo: '',
    date: '2026-08-16',
  };

  it('追加 → 名前とメモの部分更新 → 削除', async () => {
    await addSavedCombo(combo);
    await updateSavedCombo('combo-1', { name: '夏の定番', memo: 'さっぱり' });
    let d = await loadUserData();
    expect(d.savedCombos).toEqual([
      { ...combo, name: '夏の定番', memo: 'さっぱり' },
    ]);

    await deleteSavedCombo('combo-1');
    d = await loadUserData();
    expect(d.savedCombos).toEqual([]);
  });

  it('updateSavedCombo は対象以外の組み合わせに触らない', async () => {
    await addSavedCombo(combo);
    await addSavedCombo({ ...combo, id: 'combo-2', name: '別の日' });
    await updateSavedCombo('combo-2', { memo: 'こっちだけ' });
    const d = await loadUserData();
    expect(d.savedCombos.find((c) => c.id === 'combo-1')!.memo).toBe('');
    expect(d.savedCombos.find((c) => c.id === 'combo-2')!.memo).toBe('こっちだけ');
  });
});

describe('選択履歴', () => {
  it('recordSelections は食材ごとの回数を積み上げる', async () => {
    await recordSelections(['a', 'b']);
    await recordSelections(['a']);
    const d = await loadUserData();
    expect(d.selectionHistory).toEqual({ a: 2, b: 1 });
  });
});
