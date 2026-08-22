/**
 * 書体。UI 全体を Lexend(@expo-google-fonts/lexend)で組む。
 *
 * React Native の fontFamily は「1 ウェイト = 1 ファミリ名」で、Android は
 * カスタム書体に対して fontWeight を解釈しない。ウェイトごとに別名で読み込み、
 * style に書かれた fontWeight から引き当てる。引き当ての実装は
 * components/Type.tsx にあり、画面側は今までどおり fontWeight を書けばよい。
 *
 * Lexend は欧文専用で、和文グリフを持たない。日本語は OS のフォールバックで
 * 描かれるので、和文と欧文が混じる行では行の高さが揃わないことがある。
 * 気になる箇所は、その style に lineHeight を明示して固定する。
 *
 * 読み込みは hooks/use-app-fonts.ts。フォントは OFL 1.1 なので、
 * 同梱する以上ライセンス表示が要る(app/licenses.tsx)。
 */

// ウェイトごとのサブパスから読む。パッケージのルートから import すると
// index.js が 9 ウェイト全部を require していて、使わない 5 つ(約 400KB)まで
// バンドルに入る
import { Lexend_400Regular } from '@expo-google-fonts/lexend/400Regular';
import { Lexend_500Medium } from '@expo-google-fonts/lexend/500Medium';
import { Lexend_600SemiBold } from '@expo-google-fonts/lexend/600SemiBold';
import { Lexend_700Bold } from '@expo-google-fonts/lexend/700Bold';
import { Platform, type TextStyle } from 'react-native';

/** useFonts に渡す。ここに足したウェイトだけが FAMILY で使える */
export const LexendAssets = {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
} as const;

type Step = '400' | '500' | '600' | '700';

const FAMILY: Record<Step, string> = {
  '400': 'Lexend_400Regular',
  '500': 'Lexend_500Medium',
  '600': 'Lexend_600SemiBold',
  '700': 'Lexend_700Bold',
};

/**
 * web は fontFamily がそのまま CSS になるので、和文の受け皿を後ろに並べる。
 * ネイティブは OS が字ごとにフォールバックするため、この列は要らない。
 * 中身は global.css の --font-display から欧文を抜いたもの。
 */
const WEB_FALLBACK = [
  '"Hiragino Sans"',
  '"Hiragino Kaku Gothic ProN"',
  '"Noto Sans JP"',
  'Meiryo',
  'system-ui',
  'sans-serif',
].join(', ');

/** iOS 由来の名前指定。数値と違って丸めようがないので個別に対応づける */
const NAMED: Record<string, Step> = {
  normal: '400',
  regular: '400',
  light: '400',
  thin: '400',
  ultralight: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  condensed: '700',
  condensedBold: '700',
  heavy: '700',
  black: '700',
};

/** style の fontWeight を、読み込んである 4 段のいずれかに丸める */
function step(weight: TextStyle['fontWeight']): Step {
  if (weight == null) return '400';
  if (typeof weight === 'string' && weight in NAMED) return NAMED[weight];
  const n = Number(weight);
  if (!Number.isFinite(n)) return '400';
  if (n >= 700) return '700';
  if (n >= 600) return '600';
  if (n >= 500) return '500';
  return '400';
}

/** fontWeight に対応する Lexend のファミリ名(web は和文フォールバック込み) */
export function lexendFamily(weight: TextStyle['fontWeight']): string {
  const family = FAMILY[step(weight)];
  return Platform.OS === 'web' ? `${family}, ${WEB_FALLBACK}` : family;
}
