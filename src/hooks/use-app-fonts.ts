/**
 * 書体の読み込み。読み終わるまでネイティブのスプラッシュを出したままにする。
 *
 * 読み込み前に描いてしまうと、一瞬システムフォントで出てから Lexend に
 * 差し替わる。app/_layout.tsx はこれが true になるまで何も描かない。
 *
 * 失敗しても true を返す。同梱アセットなので実際には起きないが、
 * 起きたときにアプリが立ち上がらない方が損失が大きい(欧文は OS の
 * 書体で描かれ、和文は元から OS の書体なので表示自体は崩れない)。
 */

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { LexendAssets } from '@/constants/typography';

// expo-splash-screen の指示どおり、await せずグローバルで呼ぶ。
// コンポーネントの中だと、すでに自動で消えたあとになることがある。
SplashScreen.preventAutoHideAsync().catch(() => {});

export function useAppFonts() {
  const [loaded, error] = useFonts(LexendAssets);
  const ready = loaded || !!error;

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  return ready;
}
