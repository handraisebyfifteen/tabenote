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

/** splash(app.json)と揃えた地の色 */
export const THEME_COLOR = '#208AEF';

/**
 * 法務ページ(tabenote-legal リポジトリ、GitHub Pages で公開)。
 * 譲渡やドメイン変更のときは、ここだけ差し替えれば全画面に反映される。
 * 公開前に3つとも実際に開けることを確認すること(404のままだと審査に落ちる)。
 */
const LEGAL_BASE_URL = 'https://handraisebyfifteen.github.io/tabenote-legal';

/** サポートページ(App Store Connect の「サポートURL」と同じもの) */
export const SUPPORT_URL = `${LEGAL_BASE_URL}/`;
export const TERMS_URL = `${LEGAL_BASE_URL}/terms.html`;
export const PRIVACY_URL = `${LEGAL_BASE_URL}/privacy.html`;

/** iOS の購読管理(Apple の共通URL)。解約はアプリからは行えないため、ここへ誘導する */
export const MANAGE_SUBSCRIPTION_URL = 'https://apps.apple.com/account/subscriptions';
