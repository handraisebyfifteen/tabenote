/**
 * useColorScheme の静的書き出し(web)対応版。Metro が web ビルドでのみこちらを解決する。
 *
 * 静的HTMLはライトで書き出される。React はハイドレーション時にインラインスタイルの
 * 食い違いを修復しないため、React Native の useColorScheme をそのまま使うと
 * ダーク端末で「初期表示はライトのまま・後から開いた画面だけダーク」に割れる。
 * サーバースナップショットをライトに固定してハイドレートし、マウント直後に
 * クライアントの実際の設定へ再レンダーする。
 */
import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

function subscribe(onChange: () => void) {
  const sub = Appearance.addChangeListener(onChange);
  return () => sub.remove();
}

export function useColorScheme(): 'light' | 'dark' {
  return useSyncExternalStore(
    subscribe,
    () => (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'),
    () => 'light', // 静的書き出し(サーバー)は常にライト
  );
}
