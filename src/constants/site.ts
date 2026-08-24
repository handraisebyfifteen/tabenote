/**
 * 公開サイト(tabenote.app)の定数。
 *
 * +html.tsx は静的書き出し時に Node.js だけで動き、グローバルCSSを取り込めない。
 * そのため theme.ts(`@/global.css` を import している)には依存させず、ここに分ける。
 */

export const SITE_NAME = 'tabenote';

export const SITE_URL = 'https://tabenote.app';

/** OGP画像。public/og.png がそのまま dist の直下に配られる */
export const OG_IMAGE_URL = `${SITE_URL}/og.png`;

export const OG_IMAGE_WIDTH = '1200';
export const OG_IMAGE_HEIGHT = '630';

/**
 * ブラウザのUIに出る地の色。アイコンの生成り地に合わせる。
 * splash(app.json)の朱は幕として独立させた色なので、ここには持ち込まない
 */
export const THEME_COLOR = '#F1E5C7';

/**
 * 法務ページ。実体は public/ の静的HTML(support/privacy/terms/tokusho)で、
 * web ビルドで dist の直下に配られ、この公開サイトの一部として出る。
 *
 * 画面(expo-router)ではなく素のHTMLにしてあるのは、購読ゲートの外に置くため。
 * 規約とポリシーは、購読していない人にも必ず開けなければならない。
 *
 * ドメインを変えるときは SITE_URL を直せばここも追従する。
 * ただし静的HTML側の <link rel="canonical"> は手書きなので、そちらも直すこと
 * (食い違ったまま build:web すると postbuild-web.js が検知して落ちる)。
 * 公開前に4つとも実際に開けることを確認する(404のままだと審査に落ちる)。
 */

/** サポートページ(App Store Connect の「サポートURL」と同じもの) */
export const SUPPORT_URL = `${SITE_URL}/support`;
export const TERMS_URL = `${SITE_URL}/terms`;
export const PRIVACY_URL = `${SITE_URL}/privacy`;
/** 特定商取引法に基づく表記。App Store では必須ではない(tokusho.html の注記を参照) */
export const TOKUSHO_URL = `${SITE_URL}/tokusho`;

/** iOS の購読管理(Apple の共通URL)。解約はアプリからは行えないため、ここへ誘導する */
export const MANAGE_SUBSCRIPTION_URL = 'https://apps.apple.com/account/subscriptions';

/**
 * App Store の製品ページ。審査通過後に判明するURLをここに入れる。
 * null の間、紹介ページ(/about)は入手ボタンの代わりに「準備中」を出す。
 */
export const APP_STORE_URL: string | null = null;
