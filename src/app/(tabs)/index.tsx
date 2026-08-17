/**
 * ホーム — 二十四節気(指示書 6-1)。
 * 節気の説明文は solar_terms.md の2段落テキスト(段落1=暦、段落2=中医学)。
 */
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import PageHead from '@/components/PageHead';
import { Colors } from '@/constants/theme';
import { getTermText } from '@/data/solarTermTexts';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import { fiveSeasonName } from '@/i18n/terms';
import { getCurrentTerm } from '@/logic/solarTerms';
import { getFiveSeason } from '@/logic/season';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  const now = new Date();
  const { termInfo, seasonInfo } = useMemo(
    () => ({ termInfo: getCurrentTerm(now), seasonInfo: getFiveSeason(now) }),
    // 日付が変わったときだけ再計算する
    [now.getFullYear(), now.getMonth(), now.getDate()],
  );

  const next = termInfo.next;
  const termText = getTermText(termInfo.current.term.kanji);
  const paragraphs = termText ? termText[lang] : [];

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.container}
    >
      <PageHead {...t.meta.home} path="/" />

      <Text style={[styles.date, { color: c.textSecondary }]}>
        {t.home.dateLabel(now)}
      </Text>

      <View style={[styles.card, { backgroundColor: c.backgroundElement }]}>
        <Text style={[styles.termEnglish, { color: c.textSecondary }]}>
          {termInfo.current.term.english}
        </Text>
        <Text style={[styles.termKanji, { color: c.text }]}>
          {termInfo.current.term.kanji}
        </Text>
        <Text style={[styles.nextTerm, { color: c.textSecondary }]}>
          {t.home.nextTermIn(next.term.kanji, next.term.english, termInfo.daysUntilNext)}
        </Text>
        {paragraphs.map((paragraph, i) => (
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

      <View style={[styles.card, { backgroundColor: c.backgroundElement }]}>
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

      <Pressable
        style={styles.button}
        onPress={() => router.push('/(tabs)/combine')}
      >
        <Text style={styles.buttonText}>{t.home.seeSeasonFoods}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  date: { fontSize: 14 },
  card: { borderRadius: 12, padding: 20, gap: 4 },
  termEnglish: { fontSize: 14 },
  termKanji: { fontSize: 40, fontWeight: '700' },
  nextTerm: { fontSize: 13, marginTop: 8 },
  termParagraph: { fontSize: 14, lineHeight: 22, marginTop: 10 },
  sectionTitle: { fontSize: 12 },
  seasonLabel: { fontSize: 24, fontWeight: '600' },
  seasonDetail: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  button: {
    backgroundColor: '#8FAF8B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
