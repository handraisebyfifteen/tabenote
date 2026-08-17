/**
 * ホーム — 二十四節気(指示書 6-1)。
 *
 * 上半分は今日の節気の「動く風景」(TermScene)。24節気それぞれに別の
 * 景色と動きがあり、開くたびに今日の空が出る。
 * 下は行動につながる導線: いまの季節に合う食材 → 組み合わせタブ。
 * 節気の説明文は solar_terms.md の2段落テキスト(段落1=暦、段落2=中医学)で、
 * 読み物なので折りたたんで置く(読んで終わりの画面にしない)。
 */
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import FlavorPentagon, { natureColor } from '@/components/FlavorPentagon';
import FoodThumb from '@/components/FoodThumb';
import PageHead from '@/components/PageHead';
import TermScene from '@/components/TermScene';
import { Text } from '@/components/Type';
import { Colors } from '@/constants/theme';
import { getTermText } from '@/data/solarTermTexts';
import { getTermScene } from '@/data/termScenes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import { fiveFlavorAxisLabels, fiveSeasonName, foodName } from '@/i18n/terms';
import { emptyTotals } from '@/logic/flavors';
import { natureValue } from '@/logic/nature';
import { seasonalPicks } from '@/logic/seasonFoods';
import { getToday } from '@/logic/today';
import { calendarDayNumber } from '@/logic/solarTerms';

/** 「いまの季節に合う食材」を出す数 */
const PICK_COUNT = 8;

export default function HomeScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);
  const { height: windowHeight } = useWindowDimensions();

  const now = new Date();
  // 暦日が変わるまで使い回される(logic/today.ts)
  const { termInfo, seasonInfo, dayNum } = getToday(now);

  const next = termInfo.next;
  const termText = getTermText(termInfo.current.term.kanji);
  const paragraphs = termText ? termText[lang] : [];
  const [showText, setShowText] = useState(false);

  const scene = getTermScene(termInfo.current.term.index);

  // 節気の進み具合(1日目から数える)
  const termTotal =
    calendarDayNumber(next.date) - calendarDayNumber(termInfo.current.date);
  const termElapsed = termTotal - termInfo.daysUntilNext + 1;

  const picks = seasonalPicks(seasonInfo.season, dayNum, PICK_COUNT);

  /** 季節の推奨をそのまま五角形にしたもの(この季節が向かう形) */
  const seasonTotals = emptyTotals();
  for (const flavor of seasonInfo.recommendation.flavors) seasonTotals[flavor] = 1;

  // 画面の高さに合わせる。低い端末でも下のカードが顔を出す高さに抑える
  const sceneHeight = Math.max(260, Math.min(380, windowHeight * 0.46));

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.container}
    >
      <PageHead {...t.meta.home} path="/" />

      <TermScene termIndex={termInfo.current.term.index} height={sceneHeight}>
        <View style={styles.heroText}>
          <Text style={styles.heroDate}>{t.home.dateLabel(now)}</Text>
          <Text style={styles.heroEnglish}>{termInfo.current.term.english}</Text>
          <Text style={styles.heroKanji}>{termInfo.current.term.kanji}</Text>

          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round((termElapsed / termTotal) * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {t.home.termDay(termElapsed, termTotal)}
            </Text>
          </View>

          <Text style={styles.heroNext}>
            {t.home.nextTermIn(
              next.term.kanji,
              next.term.english,
              termInfo.daysUntilNext,
            )}
          </Text>
        </View>
      </TermScene>

      <View style={styles.body}>
        <View style={[styles.card, { backgroundColor: c.backgroundElement }]}>
          <View style={styles.seasonRow}>
            {/* 組み合わせ画面と同じ文法: 点線 = 季節のおすすめの味。
                塗りは「自分が選んだ構成」の意味なので、ここでは描かない */}
            <FlavorPentagon
              totals={emptyTotals()}
              natureLevel={null}
              seasonFlavors={seasonInfo.recommendation.flavors}
              axisLabels={fiveFlavorAxisLabels(lang)}
              size={124}
              labelColor={c.textSecondary}
              gridColor={scheme === 'dark' ? '#3A3D42' : '#D5D9DE'}
            />
            <View style={styles.seasonTexts}>
              <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
                {t.home.nowSeasonTitle}
              </Text>
              <Text style={[styles.seasonLabel, { color: c.text }]}>
                {fiveSeasonName(seasonInfo, lang)}
              </Text>
              <Text style={[styles.seasonDetail, { color: c.text }]}>
                {t.home.seasonSentence(
                  seasonInfo.recommendation.organ,
                  seasonInfo.recommendation.flavors,
                )}
              </Text>
              <Text style={[styles.seasonDetail, { color: c.textSecondary }]}>
                {t.home.natureLine(seasonInfo.season)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: c.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
            {t.home.seasonFoodsTitle}
          </Text>
          {/* 横スクロールにすると隠れた食材に気づけないので、折り返して全部見せる */}
          <View style={styles.picks}>
            {picks.map((food) => (
              <Pressable
                key={food.id}
                style={styles.pick}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/combine',
                    params: { ids: food.id },
                  })
                }
              >
                <FoodThumb
                  name={foodName(food, lang)}
                  icon={food.icon}
                  catIcon={food.catIcon}
                  color={natureColor(natureValue(food))}
                  size={52}
                />
                <Text
                  style={[styles.pickName, { color: c.text }]}
                  numberOfLines={1}
                >
                  {foodName(food, lang)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.hint, { color: c.textSecondary }]}>
            {t.home.seasonFoodsHint}
          </Text>
        </View>

        <Pressable
          style={[styles.button, { backgroundColor: scene.accent }]}
          accessibilityRole="button"
          onPress={() => router.push('/(tabs)/combine')}
        >
          <Text style={styles.buttonText}>{t.home.seeSeasonFoods}</Text>
        </Pressable>

        {paragraphs.length > 0 && (
          <View style={[styles.card, { backgroundColor: c.backgroundElement }]}>
            <Pressable
              style={styles.disclosure}
              accessibilityRole="button"
              accessibilityState={{ expanded: showText }}
              onPress={() => setShowText((v) => !v)}
            >
              <Text style={[styles.disclosureTitle, { color: c.text }]}>
                {t.home.aboutTermTitle}
              </Text>
              <Text style={[styles.disclosureMark, { color: c.textSecondary }]}>
                {showText ? '−' : '+'}
              </Text>
            </Pressable>
            {showText &&
              paragraphs.map((paragraph, i) => (
                <Text
                  key={i}
                  style={[
                    styles.termParagraph,
                    {
                      color:
                        paragraph.startsWith('※') || paragraph.startsWith('Note:')
                          ? c.textSecondary
                          : c.text,
                    },
                  ]}
                >
                  {paragraph}
                </Text>
              ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  body: { padding: 16, gap: 16 },

  heroText: { padding: 20, gap: 2 },
  heroDate: { color: 'rgba(255,255,255,0.82)', fontSize: 13 },
  heroEnglish: { color: 'rgba(255,255,255,0.9)', fontSize: 15, marginTop: 6 },
  heroKanji: {
    color: '#FFFFFF',
    fontSize: 46,
    fontWeight: '700',
    letterSpacing: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressFill: { height: 3, borderRadius: 2, backgroundColor: '#FFFFFF' },
  progressLabel: { color: 'rgba(255,255,255,0.82)', fontSize: 12 },
  heroNext: { color: 'rgba(255,255,255,0.86)', fontSize: 13, marginTop: 6 },

  card: { borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 12 },
  seasonRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  seasonTexts: { flex: 1, gap: 2 },
  seasonLabel: { fontSize: 22, fontWeight: '600' },
  seasonDetail: { fontSize: 13, marginTop: 4, lineHeight: 19 },

  picks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 12,
  },
  pick: { alignItems: 'center', width: 62, gap: 5 },
  pickName: { fontSize: 11, textAlign: 'center' },
  hint: { fontSize: 11 },

  button: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  disclosure: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disclosureTitle: { fontSize: 14, fontWeight: '600' },
  disclosureMark: { fontSize: 18, paddingHorizontal: 6 },
  termParagraph: { fontSize: 14, lineHeight: 22, marginTop: 12 },
});
