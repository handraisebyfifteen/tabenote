/**
 * ユーザーデータのローカル保存層(指示書 4-2)。
 * アプリは中身の解釈に関与しない。参照データ(foods)には絶対に書き込まない。
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedCombo {
  id: string;
  name: string;
  foodIds: string[];
  memo: string;
  /** YYYY-MM-DD */
  date: string;
}

/** AI推定機能(指示書 11章)専用。参照データとは完全に分離する */
export interface EstimatedNote {
  name: string;
  estimate: string;
  basis: string;
  disclaimer: string;
}

export interface UserData {
  favorites: string[];
  /** foodId -> メモ本文 */
  notes: Record<string, string>;
  savedCombos: SavedCombo[];
  /** foodId -> 選択回数(お気に入り自動昇格用) */
  selectionHistory: Record<string, number>;
  /** 未収録食材のAI推定値(ユーザーのメモ扱い) */
  estimatedNotes: Record<string, EstimatedNote>;
}

export const EMPTY_USER_DATA: UserData = {
  favorites: [],
  notes: {},
  savedCombos: [],
  selectionHistory: {},
  estimatedNotes: {},
};

const STORAGE_KEY = 'tabenote/userdata/v1';

/** 保存データを読み込む。壊れていた場合は空データに戻す(参照データは無事なので致命傷にならない) */
export async function loadUserData(): Promise<UserData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null) return { ...EMPTY_USER_DATA };
    const parsed = JSON.parse(raw) as Partial<UserData>;
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      savedCombos: Array.isArray(parsed.savedCombos) ? parsed.savedCombos : [],
      selectionHistory:
        parsed.selectionHistory && typeof parsed.selectionHistory === 'object'
          ? parsed.selectionHistory
          : {},
      estimatedNotes:
        parsed.estimatedNotes && typeof parsed.estimatedNotes === 'object'
          ? parsed.estimatedNotes
          : {},
    };
  } catch {
    return { ...EMPTY_USER_DATA };
  }
}

export async function saveUserData(data: UserData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** 読み込み→変更→保存を1回で行うヘルパー */
export async function updateUserData(
  mutate: (data: UserData) => UserData,
): Promise<UserData> {
  const current = await loadUserData();
  const next = mutate(current);
  await saveUserData(next);
  return next;
}

export async function toggleFavorite(foodId: string): Promise<UserData> {
  return updateUserData((d) => ({
    ...d,
    favorites: d.favorites.includes(foodId)
      ? d.favorites.filter((id) => id !== foodId)
      : [...d.favorites, foodId],
  }));
}

export async function setFoodNote(foodId: string, text: string): Promise<UserData> {
  return updateUserData((d) => {
    const notes = { ...d.notes };
    if (text.trim() === '') {
      delete notes[foodId];
    } else {
      notes[foodId] = text;
    }
    return { ...d, notes };
  });
}

export async function addSavedCombo(combo: SavedCombo): Promise<UserData> {
  return updateUserData((d) => ({
    ...d,
    savedCombos: [combo, ...d.savedCombos.filter((c) => c.id !== combo.id)],
  }));
}

export async function deleteSavedCombo(comboId: string): Promise<UserData> {
  return updateUserData((d) => ({
    ...d,
    savedCombos: d.savedCombos.filter((c) => c.id !== comboId),
  }));
}

/** 保存済みの組み合わせの名前・メモを部分更新する */
export async function updateSavedCombo(
  comboId: string,
  patch: Partial<Pick<SavedCombo, 'name' | 'memo'>>,
): Promise<UserData> {
  return updateUserData((d) => ({
    ...d,
    savedCombos: d.savedCombos.map((c) =>
      c.id === comboId ? { ...c, ...patch } : c,
    ),
  }));
}

/** 「決定」時に選択食材の回数を記録する(お気に入り自動昇格の材料) */
export async function recordSelections(foodIds: string[]): Promise<UserData> {
  return updateUserData((d) => {
    const history = { ...d.selectionHistory };
    for (const id of foodIds) {
      history[id] = (history[id] ?? 0) + 1;
    }
    return { ...d, selectionHistory: history };
  });
}
