/**
 * 公開サイト(tabenote.app)のトップ。Web ではアプリ本体を出さず、ここが入口になる。
 *
 * ただの「アプリを入手」ではなく、アプリのコンセプトを一枚で伝えるランディングにしてある
 * (2026-10-15)。地はアイコンと同じ生成り、差し色は朱と若草。図は画像素材ではなく、
 * 五角形を SVG で直に描く(アプリの FlavorPentagon と同じ考え方)。
 *
 * 購読の案内は「初めてのご登録なら、最初の2週間は無料」の条件付きの言い方で揃える
 * (アプリの paywall.trialNote と同じ。適格かを決めるのはストアなので断定しない)。
 *
 * 守ること:
 *   src/data・src/logic・i18n/strings に届く import をしない(scripts/postbuild-web.js が
 *   図鑑データの混入を検査してビルドを落とす。strings.ts は terms.ts 経由で図鑑に届く)。
 *   そのため文言はこのファイルに直接持ち、五味の軸ラベルも定数で持つ。
 */
import React, { useSyncExternalStore } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Line, Polygon, Text as SvgText } from 'react-native-svg';

import {
  ANDROID_STORE_URL,
  APP_STORE_URL,
  PRIVACY_URL,
  SUPPORT_URL,
  TERMS_URL,
  TOKUSHO_URL,
} from '@/constants/site';
import { lexendFamily } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLang } from '@/i18n/LanguageContext';

import PageHead from './PageHead';
import { Text } from './Type';

/**
 * 配色。アイコン(生成りの地に、朱・若草・黄・茶)から取る。
 * ダークは生成りを裏返した墨の地に、同じ差し色を少し明るく置く。
 */
interface Palette {
  ground: string;
  paper: string;
  ink: string;
  inkSoft: string;
  rule: string;
  vermilion: string;
  vermilionText: string;
  moss: string;
  mossSoft: string;
  yellow: string;
  brown: string;
  blue: string;
}

const PALETTE: Record<'light' | 'dark', Palette> = {
  light: {
    ground: '#F1E5C7', // 生成り(アイコンの地・THEME_COLOR と同じ)
    paper: '#FBF6EA', // 一段明るい紙(カード)
    ink: '#2B2A26', // 墨
    inkSoft: '#6B675D',
    rule: '#D8CBAA', // 罫線
    vermilion: '#B94D21', // 朱(スプラッシュと同じ)
    vermilionText: '#FFF4E8',
    moss: '#6B8F71', // 若草(Google Play ボタン・既存の色)
    mossSoft: '#8FAF8B', // アプリのアクセント
    yellow: '#E2C45E',
    brown: '#8C6239',
    blue: '#6D8FB5',
  },
  dark: {
    ground: '#17181A',
    paper: '#232325',
    ink: '#F1E5C7',
    inkSoft: '#B8B1A0',
    rule: '#3A3A3C',
    vermilion: '#D96A3C',
    vermilionText: '#1A0E08',
    moss: '#7FA585',
    mossSoft: '#8FAF8B',
    yellow: '#E2C45E',
    brown: '#B98A5E',
    blue: '#86A6C9',
  },
};

/** 五味の色(アイコンの花びらの順と同じ: 酸=黄、苦=若草、甘=茶、辛=朱、鹹=藍) */
const FLAVOR_KEYS = ['sour', 'bitter', 'sweet', 'pungent', 'salty'] as const;
const FLAVOR_COLOR_KEYS: Record<(typeof FLAVOR_KEYS)[number], keyof Palette> = {
  sour: 'yellow',
  bitter: 'moss',
  sweet: 'brown',
  pungent: 'vermilion',
  salty: 'blue',
};

/** 見本の五角形(かたよりのある、それらしい形)。実データの集計ではなく描画用の固定値 */
const SAMPLE_RADII = [0.55, 0.3, 0.9, 0.6, 0.35];
/** 季節の推奨形(点線)。推奨味を 80%、それ以外を 25% に置いた定型の形 */
const SEASON_RADII = [0.25, 0.25, 0.8, 0.8, 0.25];

const COPY = {
  ja: {
    headTitle: 'tabenote — 料理人の食材手帳',
    headDescription:
      '季節と味の釣り合いで食材を選び、自分の言葉で書き残す手帳アプリ。初めてのご登録なら最初の2週間は無料。iOS / Android。',
    wordmark: 'tabenote',
    // 「。」で改行を固定する。成り行きだと幅によって「あな／た」で折れる
    tagline: '食材選びの手帳。\n書くのは、あなた',
    lead: '経験を積んだ料理人がするように、季節と味の釣り合いで食材を選ぶ。東アジアの台所で受け継がれてきた分類を、図と言葉で確かめ、感じたことを自分の言葉で書き残す。そのための静かな手帳です。',
    trialBadge: '初めてのご登録なら、最初の2週間は無料',
    trialNote: '無料期間中に解約すれば料金はかかりません。その後は月額プラン(日本のストアでは月額1,000円)。',
    ios: 'App Store で入手',
    android: 'Google Play で入手',
    iosSoon: 'iOS版は App Store で準備中です',
    webNote: 'Web版はありません。アプリは iPhone と Android でお使いいただけます。',
    flavors: ['酸', '苦', '甘', '辛', '鹹'] as [string, string, string, string, string],
    flavorsEyebrow: '五味',
    sampleCaption: '点線は、いまの季節がすすめる味のかたち',
    sections: [
      {
        eyebrow: '組み合わせ',
        title: '選んだ食材が、ひとつの図形になる',
        body: '食材を選ぶと、その組み合わせの五味(酸・苦・甘・辛・鹹)の構成と、性(寒熱)の傾向が、ひとつの五角形になります。何が多くて、何が足りないか。数字ではなく、かたちで分かります。',
      },
      {
        eyebrow: '二十四節気',
        title: '季節が、味をすすめる',
        body: 'いまがどの節気か、五季(春・夏・長夏・秋・冬)のどこにいるか。その季節にすすめられる味を、点線のかたちで五角形に重ねます。選んだ食材と季節から、AIが献立の方向性も提案します。',
      },
      {
        eyebrow: '手帳',
        title: '435品目の図鑑に、自分の言葉で',
        body: '性・五味・帰経・分類を収めた図鑑に、★とメモを付けていく。気に入った組み合わせは手帳に保存。データはすべて端末の中に残り、アカウント登録は要りません。',
      },
    ],
    policyTitle: '効能は、アプリが書きません',
    policyBody:
      'tabenote が示すのは、五味・性・帰経・分類という伝統的な分類の事実まで。「効く」「治る」といった効能や、症状・病名は扱わず、点数も付けません。解釈と記録は、持ち主であるあなたのものです。本アプリは医師の診断・治療の代わりにはなりません。',
    ctaTitle: '2週間、無料で始める',
    ctaBody: 'お使いの端末のストアからどうぞ。初めてのご登録なら、最初の2週間は無料です。',
    support: 'サポート',
    terms: '利用規約',
    privacy: 'プライバシー',
    tokusho: '特定商取引法に基づく表記',
    langSwitch: 'English',
    copyright: '© 2026 tabenote',
  },
  en: {
    headTitle: 'tabenote — a chef’s ingredient notebook',
    headDescription:
      'Choose ingredients by season and the balance of flavors, and write what you notice in your own words. New subscribers start with 2 weeks free. iOS / Android.',
    wordmark: 'tabenote',
    tagline: 'A chef’s eye for ingredients. You write the rest.',
    lead: 'Choose ingredients the way a seasoned chef does — by season and the balance of flavors. A classification refined over centuries in East Asian kitchens, shown as shapes and words, with room to write what you notice. A quiet notebook, made for that.',
    trialBadge: 'New subscribers start with 2 weeks free',
    trialNote: 'Cancel during the trial and you are not charged. Then a monthly plan — $9.99/month, with your local price shown in the store.',
    ios: 'Get it on the App Store',
    android: 'Get it on Google Play',
    iosSoon: 'The iOS app is coming to the App Store',
    webNote: 'There is no web version. tabenote is for iPhone and Android.',
    flavors: ['Sour', 'Bitter', 'Sweet', 'Pungent', 'Salty'] as [string, string, string, string, string],
    flavorsEyebrow: 'The five flavors',
    sampleCaption: 'The dotted shape is what this season favors',
    sections: [
      {
        eyebrow: 'Combine',
        title: 'Your ingredients become one shape',
        body: 'Pick ingredients, and the combination’s five flavors (sour, bitter, sweet, pungent, salty) and thermal nature are drawn as a single pentagon. What is abundant, what is missing — not a number, a shape.',
      },
      {
        eyebrow: 'The 24 solar terms',
        title: 'The season suggests the flavors',
        body: 'See which solar term today falls in and where you are among the five seasons. The flavors favored right now are laid over the pentagon as a dotted outline. From your ingredients and the season, AI suggests directions a dish could take.',
      },
      {
        eyebrow: 'Notebook',
        title: '435 ingredients, in your own words',
        // 英文に "meridians" と書かない(postbuild-web.js が図鑑JSONのフィールド名として
        // 公開JSを検査するため、文言でも引っかかる)。ストアの説明文と同じ "meridian tropism" で
        body: 'An index of nature, five flavors, meridian tropism and category — star the ones you like and keep notes. Save the combinations that work. Everything stays on your device; no account needed.',
      },
    ],
    policyTitle: 'The app never writes effects',
    policyBody:
      'tabenote shows classification as fact — five flavors, nature, meridian tropism, category — and stops there. No claims of what “works” or “heals”, no symptoms, no diagnoses, no scores. The interpretation and the notes are yours. This app is not a substitute for medical diagnosis or treatment.',
    ctaTitle: 'Start with 2 weeks free',
    ctaBody: 'Get it from the store for your device. New subscribers start with 2 weeks free.',
    support: 'Support',
    terms: 'Terms',
    privacy: 'Privacy',
    tokusho: 'Legal notice (JP)',
    langSwitch: '日本語',
    copyright: '© 2026 tabenote',
  },
} as const;

/**
 * 画面の幅。useWindowDimensions ではなく外部ストアとして読む。
 *
 * 静的HTMLは幅 0 で書き出され、React はハイドレーション時にスタイルの食い違いを
 * 修復しないため、最初の描画で広い幅を返すと「狭い並びのまま固まる」
 * (hooks/use-system-color-scheme.web.ts と同じ事情)。サーバー側の値を 0 に固定して
 * ハイドレートし、マウント直後に実際の幅で描き直す。
 */
function subscribeWidth(onChange: () => void) {
  const sub = Dimensions.addEventListener('change', onChange);
  return () => sub.remove();
}
function useViewportWidth(): number {
  return useSyncExternalStore(
    subscribeWidth,
    () => Dimensions.get('window').width,
    () => 0,
  );
}

/** i番目の軸の座標(酸を真上に、時計回りに 苦・甘・辛・鹹)。FlavorPentagon と同じ置き方 */
function axisPoint(center: number, radius: number, i: number): [number, number] {
  const angle = ((-90 + i * 72) * Math.PI) / 180;
  return [center + radius * Math.cos(angle), center + radius * Math.sin(angle)];
}

function polygonPoints(center: number, radii: number[]): string {
  return radii
    .map((r, i) => axisPoint(center, r, i))
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ');
}

/** 見本の五角形。図鑑データに依存しないよう、形は上の定数で固定 */
function SamplePentagon({
  size,
  labels,
  p,
}: {
  size: number;
  labels: [string, string, string, string, string];
  p: Palette;
}) {
  const center = size / 2;
  const R = center - 26;
  return (
    <Svg width={size} height={size}>
      {[1 / 3, 2 / 3, 1].map((frac) => (
        <Polygon
          key={frac}
          points={polygonPoints(center, SAMPLE_RADII.map(() => R * frac))}
          fill="none"
          stroke={p.rule}
          strokeWidth={1}
        />
      ))}
      {SAMPLE_RADII.map((_, i) => {
        const [x, y] = axisPoint(center, R, i);
        return (
          <Line key={i} x1={center} y1={center} x2={x} y2={y} stroke={p.rule} strokeWidth={1} />
        );
      })}
      <Polygon
        points={polygonPoints(center, SEASON_RADII.map((r) => r * R))}
        fill="none"
        stroke={p.inkSoft}
        strokeWidth={1.5}
        strokeDasharray="4,4"
      />
      <Polygon
        points={polygonPoints(center, SAMPLE_RADII.map((r) => r * R))}
        fill={p.mossSoft}
        fillOpacity={0.45}
        stroke={p.moss}
        strokeWidth={2}
      />
      {labels.map((label, i) => {
        const [x, y] = axisPoint(center, R + 16, i);
        return (
          <SvgText
            key={label}
            x={x}
            y={y + 4}
            fontSize={label.length > 2 ? 11 : 14}
            fontFamily={lexendFamily('500')}
            fill={p.ink}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

export default function DownloadScreen() {
  const scheme = useColorScheme();
  const p = PALETTE[scheme === 'dark' ? 'dark' : 'light'];
  const { lang, setLang } = useLang();
  const t = COPY[lang === 'ja' ? 'ja' : 'en'];
  const width = useViewportWidth();
  // 幅があるときはヒーローを左右に割る(左: 図、右: 文)。狭ければ縦に積む
  const wide = width >= 760;

  const open = (url: string) => {
    void Linking.openURL(url);
  };

  const storeButtons = (
    <View style={styles.buttons}>
      {APP_STORE_URL ? (
        <Pressable
          accessibilityRole="link"
          style={[styles.button, { backgroundColor: p.ink }]}
          onPress={() => open(APP_STORE_URL)}
        >
          <Text style={[styles.buttonText, { color: p.ground }]}>{t.ios}</Text>
        </Pressable>
      ) : (
        <View style={[styles.button, { borderWidth: 1, borderColor: p.rule }]}>
          <Text style={[styles.buttonText, { color: p.inkSoft }]}>{t.iosSoon}</Text>
        </View>
      )}
      <Pressable
        accessibilityRole="link"
        style={[styles.button, { backgroundColor: p.moss }]}
        onPress={() => open(ANDROID_STORE_URL)}
      >
        <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{t.android}</Text>
      </Pressable>
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: p.ground }} contentContainerStyle={styles.page}>
      <PageHead title={t.headTitle} description={t.headDescription} path="/" />

      {/* 天: ワードマークと言語の切り替え */}
      <View style={[styles.topBar, styles.column]}>
        <Text style={[styles.topWordmark, { color: p.ink }]}>{t.wordmark}</Text>
        <Pressable
          onPress={() => setLang(lang === 'ja' ? 'en' : 'ja')}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text style={[styles.langSwitch, { color: p.inkSoft, borderColor: p.rule }]}>
            {t.langSwitch}
          </Text>
        </Pressable>
      </View>

      {/* ヒーロー: アイコンの花と、言いたいことの全部 */}
      <View style={[styles.hero, styles.column, wide && styles.heroWide]}>
        <View style={[styles.heroArt, wide && styles.heroArtWide]}>
          <View style={[styles.artFrame, { backgroundColor: p.paper, borderColor: p.rule }]}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.art}
              accessibilityLabel="tabenote"
            />
          </View>
        </View>

        <View style={[styles.heroText, wide && styles.heroTextWide]}>
          <Text style={[styles.tagline, wide && styles.left, { color: p.ink }]}>{t.tagline}</Text>
          <Text style={[styles.lead, wide && styles.left, { color: p.inkSoft }]}>{t.lead}</Text>

          <View style={[styles.trialBadge, { backgroundColor: p.vermilion }]}>
            <Text style={[styles.trialBadgeText, { color: p.vermilionText }]}>
              {t.trialBadge}
            </Text>
          </View>
          <Text style={[styles.trialNote, wide && styles.left, { color: p.inkSoft }]}>
            {t.trialNote}
          </Text>

          {storeButtons}
          <Text style={[styles.webNote, wide && styles.left, { color: p.inkSoft }]}>
            {t.webNote}
          </Text>
        </View>
      </View>

      {/* 五味の帯: 花びら五色をそのまま並べる */}
      <View style={[styles.flavorBand, styles.column, { borderColor: p.rule }]}>
        <Text style={[styles.eyebrow, { color: p.inkSoft }]}>{t.flavorsEyebrow}</Text>
        {/* 狭い幅では 5 つが 1 行に収まらず 4+1 に割れるので、点を上に置いて 5 等分する */}
        <View style={[styles.flavorRow, !wide && styles.flavorRowNarrow]}>
          {FLAVOR_KEYS.map((key, i) => (
            <View key={key} style={[styles.flavorItem, !wide && styles.flavorItemNarrow]}>
              <View style={[styles.flavorDot, { backgroundColor: p[FLAVOR_COLOR_KEYS[key]] }]} />
              <Text style={[styles.flavorLabel, { color: p.ink }]}>{t.flavors[i]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 本文: 見本の五角形と、三つの柱 */}
      <View style={[styles.body, styles.column, wide && styles.bodyWide]}>
        <View style={[styles.sampleCard, { backgroundColor: p.paper, borderColor: p.rule }]}>
          <SamplePentagon size={wide ? 300 : 260} labels={t.flavors} p={p} />
          <Text style={[styles.sampleCaption, { color: p.inkSoft }]}>{t.sampleCaption}</Text>
        </View>

        <View style={[styles.sections, wide && styles.sectionsWide]}>
          {t.sections.map((s) => (
            <View key={s.title} style={[styles.section, { borderColor: p.rule }]}>
              <Text style={[styles.eyebrow, { color: p.vermilion }]}>{s.eyebrow}</Text>
              <Text style={[styles.sectionTitle, { color: p.ink }]}>{s.title}</Text>
              <Text style={[styles.sectionBody, { color: p.inkSoft }]}>{s.body}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 立場: 効能は書かない */}
      <View style={[styles.policy, styles.column]}>
        <View style={[styles.policyCard, { backgroundColor: p.ink }]}>
          <Text style={[styles.policyTitle, { color: p.ground }]}>{t.policyTitle}</Text>
          <Text style={[styles.policyBody, { color: p.ground }]}>{t.policyBody}</Text>
        </View>
      </View>

      {/* 結び: もう一度、入手へ */}
      <View style={[styles.closing, styles.column]}>
        <Text style={[styles.closingTitle, { color: p.ink }]}>{t.ctaTitle}</Text>
        <Text style={[styles.closingBody, { color: p.inkSoft }]}>{t.ctaBody}</Text>
        {storeButtons}
      </View>

      <View style={[styles.footer, styles.column, { borderColor: p.rule }]}>
        <View style={styles.footerLinks}>
          {[
            [t.support, SUPPORT_URL],
            [t.terms, TERMS_URL],
            [t.privacy, PRIVACY_URL],
            [t.tokusho, TOKUSHO_URL],
          ].map(([label, url]) => (
            <Pressable key={url} onPress={() => open(url)} hitSlop={8}>
              <Text style={[styles.footerLink, { color: p.inkSoft }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.copyright, { color: p.inkSoft }]}>{t.copyright}</Text>
      </View>
    </ScrollView>
  );
}

const COLUMN = 1040;

const styles = StyleSheet.create({
  page: { paddingBottom: 48 },
  column: { width: '100%', maxWidth: COLUMN, alignSelf: 'center', paddingHorizontal: 24 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 8,
  },
  topWordmark: { fontSize: 20, fontWeight: '700', letterSpacing: 0.5 },
  langSwitch: {
    fontSize: 13,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  hero: { paddingTop: 24, paddingBottom: 40, gap: 28, alignItems: 'center' },
  heroWide: { flexDirection: 'row', alignItems: 'center', gap: 48, paddingTop: 40 },
  heroArt: { alignItems: 'center' },
  heroArtWide: { flex: 5 },
  artFrame: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 18,
  },
  art: { width: 240, height: 240, borderRadius: 20 },
  heroText: { alignItems: 'center', gap: 14, maxWidth: 560 },
  heroTextWide: { flex: 6, alignItems: 'flex-start', maxWidth: undefined },
  left: { textAlign: 'left' },
  tagline: { fontSize: 34, lineHeight: 44, fontWeight: '700', textAlign: 'center' },
  lead: { fontSize: 16, lineHeight: 27, textAlign: 'center' },
  trialBadge: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginTop: 6,
  },
  trialBadgeText: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  trialNote: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: -4 },
  buttons: { width: '100%', maxWidth: 420, gap: 10, marginTop: 8 },
  button: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  webNote: { fontSize: 12, lineHeight: 18, textAlign: 'center' },

  flavorBand: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 12,
  },
  flavorRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 22 },
  flavorRowNarrow: { width: '100%', gap: 0 },
  flavorItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flavorItemNarrow: { flexDirection: 'column', width: '20%', gap: 6 },
  flavorDot: { width: 14, height: 14, borderRadius: 7 },
  flavorLabel: { fontSize: 15, fontWeight: '500' },
  eyebrow: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },

  body: { paddingTop: 40, paddingBottom: 16, gap: 32, alignItems: 'center' },
  bodyWide: { flexDirection: 'row', alignItems: 'flex-start', gap: 48 },
  sampleCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  sampleCaption: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
  sections: { width: '100%', maxWidth: 560, gap: 8 },
  sectionsWide: { flex: 1, maxWidth: undefined },
  section: { borderTopWidth: 1, paddingVertical: 20, gap: 6 },
  sectionTitle: { fontSize: 21, lineHeight: 30, fontWeight: '600' },
  sectionBody: { fontSize: 15, lineHeight: 25 },

  policy: { paddingTop: 32 },
  policyCard: { borderRadius: 24, padding: 28, gap: 10 },
  policyTitle: { fontSize: 22, lineHeight: 31, fontWeight: '600' },
  policyBody: { fontSize: 15, lineHeight: 25, opacity: 0.92 },

  closing: { paddingTop: 48, paddingBottom: 24, alignItems: 'center', gap: 10 },
  closingTitle: { fontSize: 28, lineHeight: 38, fontWeight: '700', textAlign: 'center' },
  closingBody: { fontSize: 15, lineHeight: 24, textAlign: 'center', maxWidth: 480 },

  footer: { borderTopWidth: 1, paddingTop: 20, alignItems: 'center', gap: 10 },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  footerLink: { fontSize: 13, textDecorationLine: 'underline' },
  copyright: { fontSize: 12 },
});
