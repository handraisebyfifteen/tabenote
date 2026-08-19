/**
 * 初回起動のオンボーディング(申請準備指示書・Guideline 4.2 対策)。
 *
 * 未購読の間、app/_layout がタブの代わりにこれを表示する(ハードペイウォール)。
 * 3枚でアプリの中身を見せてから、購読案内(PaywallContent)に進む。
 * 図は画像素材ではなく実物のコンポーネントで描く(権利がクリーンで、実装と乖離しない)。
 */
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FlavorPentagon from '@/components/FlavorPentagon';
import PaywallContent from '@/components/PaywallContent';
import { Text } from '@/components/Type';
import { Colors, MaxContentWidth } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import { fiveFlavorAxisLabels, fiveSeasonName } from '@/i18n/terms';
import type { FlavorTotals } from '@/logic/flavors';
import { getFiveSeason } from '@/logic/season';

const ACCENT = '#8FAF8B';

/** 見本の五角形(かたよりのある、それらしい形)。実データの集計ではなく描画用の固定値 */
const SAMPLE_TOTALS: FlavorTotals = { 酸: 1, 苦: 0.5, 甘: 2, 辛: 1, 鹹: 0.5 };

export default function Onboarding() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  // 0〜2: 紹介ページ / 3: 購読案内
  const [step, setStep] = useState(0);

  const seasonInfo = useMemo(() => getFiveSeason(new Date()), []);

  if (step === 3) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: c.background }]}>
        <PaywallContent source="onboarding" />
      </SafeAreaView>
    );
  }

  const page = t.onboarding.pages[step];

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: c.background }]}>
      <View style={styles.skipRow}>
        <Pressable onPress={() => setStep(3)} hitSlop={12}>
          <Text style={[styles.skip, { color: c.textSecondary }]}>
            {t.onboarding.skip}
          </Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.visual}>
          {step === 0 && (
            <FlavorPentagon
              totals={SAMPLE_TOTALS}
              natureLevel={0}
              seasonFlavors={seasonInfo.recommendation.flavors}
              axisLabels={fiveFlavorAxisLabels(lang)}
              size={210}
              labelColor={c.text}
            />
          )}

          {step === 1 && (
            <View style={[styles.mockCard, { backgroundColor: c.backgroundElement }]}>
              <View style={styles.mockHeader}>
                <Text style={styles.mockStar}>★</Text>
                <View
                  style={[styles.mockTitleBar, { backgroundColor: c.backgroundSelected }]}
                />
              </View>
              <View style={[styles.mockLine, { backgroundColor: c.backgroundSelected }]} />
              <View
                style={[
                  styles.mockLine,
                  styles.mockLineShort,
                  { backgroundColor: c.backgroundSelected },
                ]}
              />
              <View style={styles.mockEmojiRow}>
                {['🥕', '🫚', '🍐'].map((e) => (
                  <View
                    key={e}
                    style={[styles.mockTile, { backgroundColor: c.backgroundSelected }]}
                  >
                    <Text style={styles.mockEmoji}>{e}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={[styles.mockCard, { backgroundColor: c.backgroundElement }]}>
              <View style={[styles.seasonChip, { backgroundColor: ACCENT }]}>
                <Text style={styles.seasonChipText}>
                  {fiveSeasonName(seasonInfo, lang)}
                </Text>
              </View>
              <View style={[styles.mockLine, { backgroundColor: c.backgroundSelected }]} />
              <View style={[styles.mockLine, { backgroundColor: c.backgroundSelected }]} />
              <View
                style={[
                  styles.mockLine,
                  styles.mockLineShort,
                  { backgroundColor: c.backgroundSelected },
                ]}
              />
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: c.text }]}>{page.title}</Text>
        <Text style={[styles.pageBody, { color: c.textSecondary }]}>{page.body}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === step ? ACCENT : c.backgroundSelected },
              ]}
            />
          ))}
        </View>
        <Pressable
          onPress={() => setStep((s) => s + 1)}
          accessibilityRole="button"
          style={[styles.next, { backgroundColor: ACCENT }]}
        >
          <Text style={styles.nextLabel}>{t.onboarding.next}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  skipRow: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16 },
  skip: { fontSize: 14 },
  body: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 12,
  },
  visual: { alignItems: 'center', marginBottom: 12, minHeight: 220, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600', textAlign: 'center' },
  pageBody: { fontSize: 14, lineHeight: 23, textAlign: 'center' },
  footer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: 24,
    gap: 16,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  next: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  mockCard: { width: 260, borderRadius: 16, padding: 20, gap: 10 },
  mockHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mockStar: { color: '#E5B800', fontSize: 18 },
  mockTitleBar: { flex: 1, height: 14, borderRadius: 7 },
  mockLine: { height: 10, borderRadius: 5 },
  mockLineShort: { width: '60%' },
  mockEmojiRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  mockTile: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockEmoji: { fontSize: 26 },
  seasonChip: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  seasonChipText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
