/**
 * 書き出しデータの組み立て(設定画面と購読案内のゲートで共用)。
 *
 * 出すのは利用者が作ったもの(メモ・★・保存した組み合わせ・選択履歴・AI推定メモ)と
 * 食材の「表示名」だけ。図鑑の分類データ(性・五味・帰経・カテゴリ)は、書き出しが
 * アプリの代替にならないよう絶対に含めない(2026-08-25 決定)。
 * ID は再取り込みの可能性に備えて表示名と並記する。
 */
import { getFood } from '../data/foods';
import { foodName, type Lang } from '../i18n/terms';
import type { UserData } from './storage';

export interface ExportPayload {
  app: 'tabenote';
  /** 1: ID のみ(〜2026-08) / 2: 表示名を並記した現行形式 */
  format: 2;
  exportedAt: string;
  /** 表示名の言語(書き出し時のUI言語) */
  lang: Lang;
  notes: { id: string; name: string; memo: string }[];
  favorites: { id: string; name: string }[];
  savedCombos: {
    id: string;
    name: string;
    /** YYYY-MM-DD */
    date: string;
    foods: { id: string; name: string }[];
    memo: string;
  }[];
  /** キーは検索された食材名(storage の Record をそのまま保つ) */
  estimatedNotes: UserData['estimatedNotes'];
  selectionHistory: { id: string; name: string; count: number }[];
}

/** 図鑑から表示名を引く。図鑑に無いID(壊れたデータ)は ID をそのまま出す */
function nameOf(id: string, lang: Lang): string {
  const food = getFood(id);
  return food === undefined ? id : foodName(food, lang);
}

export function buildExportPayload(
  data: UserData,
  lang: Lang,
  exportedAt: string,
): ExportPayload {
  return {
    app: 'tabenote',
    format: 2,
    exportedAt,
    lang,
    notes: Object.entries(data.notes).map(([id, memo]) => ({
      id,
      name: nameOf(id, lang),
      memo,
    })),
    favorites: data.favorites.map((id) => ({ id, name: nameOf(id, lang) })),
    savedCombos: data.savedCombos.map((combo) => ({
      id: combo.id,
      name: combo.name,
      date: combo.date,
      foods: combo.foodIds.map((id) => ({ id, name: nameOf(id, lang) })),
      memo: combo.memo,
    })),
    estimatedNotes: data.estimatedNotes,
    selectionHistory: Object.entries(data.selectionHistory).map(
      ([id, count]) => ({ id, name: nameOf(id, lang), count }),
    ),
  };
}

/** 書き出しファイル名(端末のローカル日付)。例: tabenote-2026-08-25.json */
export function exportFileName(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `tabenote-${y}-${m}-${d}.json`;
}
