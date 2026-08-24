/**
 * 端末の言語から既定の表示言語を決める(指示書 6-4「言語」)。
 *
 * このアプリは日本国内向けではないので、既定は英語。日本語端末のときだけ
 * 日本語で開く。翻訳が en / ja の2本しかないため、それ以外の言語は英語に倒す。
 *
 * expo-localization に依存しない純関数として切り出してある(テストのため)。
 * 実際に端末を読むのは LanguageContext の deviceDefaultLang()。
 */
import type { Lang } from './terms';

/** expo-localization の Locale のうち、判定に使う分だけ */
export type DeviceLocale = { languageCode?: string | null };

/**
 * 端末の言語一覧(優先順)から既定の表示言語を選ぶ。
 *
 * 見るのは先頭の1件だけ。一覧を端から探すと、英語を第1・日本語を第2に
 * 置いている端末まで日本語で開いてしまう。
 */
export function pickLang(locales: readonly DeviceLocale[] | null | undefined): Lang {
  const preferred = locales?.[0]?.languageCode ?? '';
  // languageCode は本来 'ja' だが、'ja-JP' が来ても拾えるようにしておく
  return preferred.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}
