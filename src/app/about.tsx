/**
 * 紹介ページ(指示書外・公開サイト用)。
 *
 * 公開サイト(tabenote.app)のランディングを兼ねる。App Store Connect の
 * マーケティングURLの受け皿でもあり、初めての人がここを読めばアプリの
 * 立場(効能は書かない)まで分かる構成にする。文面は App Store の説明文
 * (docs/asc-metadata.md)と揃え、定義は i18n/strings.ts の about に置く。
 *
 * ネイティブでは設定画面から開ける。CTA(ブラウザで試す・App Store)は
 * すでにアプリの中にいる人には意味がないので web でだけ出す。
 */
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FlavorPentagon from '@/components/FlavorPentagon';
import PageHead from '@/components/PageHead';
import { Text } from '@/components/Type';
import {
  APP_STORE_URL,
  PRIVACY_URL,
  SUPPORT_URL,
  TERMS_URL,
} from '@/constants/site';
import { Colors, MaxContentWidth } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import { fiveFlavorAxisLabels } from '@/i18n/terms';
import type { FlavorTotals } from '@/logic/flavors';
import { getFiveSeason } from '@/logic/season';

const ACCENT = '#8FAF8B';

/** 見本の五角形(Onboarding と同じ、かたよりのある形)。実データの集計ではない */
const SAMPLE_TOTALS: FlavorTotals = { 酸: 1, 苦: 0.5, 甘: 2, 辛: 1, 鹹: 0.5 };

export default function AboutScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  const seasonInfo = useMemo(() => getFiveSeason(new Date()), []);
  const web = Platform.OS === 'web';
  // import した束縛のままだと onPress の中で null 除去が効かないため、一度受ける
  const appStoreUrl = APP_STORE_URL;
  // Android の edge-to-edge でナビゲーションバーが重なる分を下端に足す
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={[styles.container, { paddingBottom: 32 + insets.bottom }]}
    >
      <PageHead {...t.meta.about} path="/about" />

      <View style={styles.body}>
        <View style={styles.hero}>
          <FlavorPentagon
            totals={SAMPLE_TOTALS}
            natureLevel={0}
            seasonFlavors={seasonInfo.recommendation.flavors}
            axisLabels={fiveFlavorAxisLabels(lang)}
            size={190}
            labelColor={c.text}
          />
          <Text style={[styles.name, { color: c.text }]}>tabenote</Text>
          <Text style={[styles.tagline, { color: c.textSecondary }]}>
            {t.about.tagline}
          </Text>
          <Text style={[styles.lead, { color: c.text }]}>{t.about.lead}</Text>
        </View>

        {web && (
          <View style={styles.ctas}>
            <Pressable
              style={[styles.cta, { backgroundColor: ACCENT }]}
              accessibilityRole="button"
              onPress={() => router.push('/')}
            >
              <Text style={styles.ctaLabel}>{t.about.tryWeb}</Text>
            </Pressable>
            {appStoreUrl !== null ? (
              <Pressable
                style={[styles.cta, { backgroundColor: c.backgroundElement }]}
                accessibilityRole="button"
                onPress={() => Linking.openURL(appStoreUrl)}
              >
                <Text style={[styles.ctaLabel, { color: c.text }]}>
                  {t.about.appStore}
                </Text>
              </Pressable>
            ) : (
              <Text style={[styles.soon, { color: c.textSecondary }]}>
                {t.about.appStoreSoon}
              </Text>
            )}
          </View>
        )}

        {t.about.sections.map((section) => (
          <View
            key={section.title}
            style={[styles.card, { backgroundColor: c.backgroundElement }]}
          >
            <Text style={[styles.cardTitle, { color: c.text }]}>
              {section.title}
            </Text>
            <Text style={[styles.cardBody, { color: c.textSecondary }]}>
              {section.body}
            </Text>
          </View>
        ))}

        {/* このアプリの立場。機能紹介と混ざらないよう、枠の色で区別する */}
        <View style={[styles.card, styles.policy, { borderColor: ACCENT }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>
            {t.about.policyTitle}
          </Text>
          <Text style={[styles.cardBody, { color: c.textSecondary }]}>
            {t.about.policyBody}
          </Text>
        </View>

        <View style={styles.footer}>
          {(
            [
              [t.settings.contact, SUPPORT_URL],
              [t.settings.terms, TERMS_URL],
              [t.settings.privacy, PRIVACY_URL],
            ] as const
          ).map(([label, url]) => (
            <Pressable key={url} onPress={() => Linking.openURL(url)} hitSlop={8}>
              <Text style={[styles.footerLink, { color: c.textSecondary }]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 16,
  },

  hero: { alignItems: 'center', gap: 4, paddingVertical: 16 },
  name: { fontSize: 34, fontWeight: '700', marginTop: 16, letterSpacing: 1 },
  tagline: { fontSize: 15 },
  lead: { fontSize: 14, lineHeight: 23, textAlign: 'center', marginTop: 12 },

  ctas: { gap: 10 },
  cta: { borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  ctaLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  soon: { fontSize: 13, textAlign: 'center' },

  card: { borderRadius: 12, padding: 16, gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardBody: { fontSize: 14, lineHeight: 22 },
  policy: { borderWidth: 1 },

  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 8,
  },
  footerLink: { fontSize: 13, textDecorationLine: 'underline' },
});
