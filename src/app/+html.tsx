/**
 * web の静的書き出しのルートHTML(指示書外・公開サイト用)。
 *
 * このファイルは書き出し時の Node.js でしか動かない。書けるのは全ページ共通の <head> だけで、
 * ページごとの題と説明は各画面の PageHead(expo-router/head)が上書きする。
 * グローバルCSSはここに import しない(静的レンダリングの制約)。
 *
 * favicon と CSS の <link> は Expo CLI が別途差し込むので、ここには書かない。
 */
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_URL,
  OG_IMAGE_WIDTH,
  SITE_NAME,
  THEME_COLOR,
} from '@/constants/site';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* 画面側が上書きしない分の既定値。題・説明・URLは PageHead が入れる */}
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ja_JP" />
        <meta property="og:image" content={OG_IMAGE_URL} />
        <meta property="og:image:width" content={OG_IMAGE_WIDTH} />
        <meta property="og:image:height" content={OG_IMAGE_HEIGHT} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={OG_IMAGE_URL} />
        <meta name="theme-color" content={THEME_COLOR} />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
