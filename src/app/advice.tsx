/**
 * アドバイス画面(指示書 6-2 後半)。
 *
 * 出す内容は「事実」と「比較」と「料理としての釣り合い」のみ。
 * 効能・症状・点数は出さない(指示書 2章)。
 *
 * 五味の過不足 / 5大分類の過不足 / 季節との関係 / 正反対の検知 / 補うなら / 調理法の方向性 / 手帳に保存。
 * 「補うなら」の候補は、お気に入り・選択履歴・季節の推奨(性)を優先する(logic/suggest)。
 * AIによる献立提案(有料)はフェーズ9で実装する。
 */
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import FlavorPentagon from '@/components/FlavorPentagon';
import { Colors } from '@/constants/theme';
import { getFood, type Food } from '@/data/foods';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import {
  fiveFlavorAxisLabels,
  fiveSeasonName,
  foodName,
  joinFoodNames,
} from '@/i18n/terms';
import { aggregateFlavors, dominantFlavors, missingFlavors } from '@/logic/flavors';
import { missingCats } from '@/logic/coverage';
import { averageNatureLevel } from '@/logic/nature';
import { findOppositePair } from '@/logic/opposites';
import { getFiveSeason } from '@/logic/season';
import {
  EMPTY_SUGGESTION_CONTEXT,
  fillSuggestions,
  type SuggestionContext,
} from '@/logic/suggest';
import { addSavedCombo, loadUserData } from '@/lib/storage';

export default function AdviceScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  const { ids } = useLocalSearchParams<{ ids: string }>();
  const foods = useMemo(
    () =>
      (ids ?? '')
        .split(',')
        .map((id) => getFood(id))
        .filter((f): f is Food => f !== undefined),
    [ids],
  );

  const totals = useMemo(() => aggregateFlavors(foods), [foods]);
  const natureLevel = useMemo(() => averageNatureLevel(foods), [foods]);
  const missing = missingFlavors(totals);
  const dominant = dominantFlavors(totals);
  const missingCategories = missingCats(foods);
  const opposite = useMemo(() => findOppositePair(foods), [foods]);
  const seasonInfo = useMemo(() => getFiveSeason(new Date()), []);

  const [saved, setSaved] = useState(false);

  const [suggestionCtx, setSuggestionCtx] = useState<SuggestionContext>(
    EMPTY_SUGGESTION_CONTEXT,
  );
  useEffect(() => {
    let active = true;
    loadUserData().then((d) => {
      if (!active) return;
      setSuggestionCtx({
        favorites: d.favorites,
        selectionHistory: d.selectionHistory,
        seasonNatureLevels: seasonInfo.recommendation.natureLevels,
      });
    });
    return () => {
      active = false;
    };
  }, [seasonInfo]);

  const suggestions = useMemo(
    () => (foods.length > 0 ? fillSuggestions(foods, suggestionCtx) : null),
    [foods, suggestionCtx],
  );

  const save = async () => {
    if (saved) return;
    const now = new Date();
    const dateIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    await addSavedCombo({
      id: `combo-${now.getTime().toString(36)}`,
      name: t.advice.defaultComboName(now.getMonth() + 1, now.getDate()),
      foodIds: foods.map((f) => f.id),
      memo: '',
      date: dateIso,
    });
    setSaved(true);
  };

  const flavorFact = t.advice.flavorFact(dominant, missing);
  const categoryFact = t.advice.categoryFact(missingCategories);

  const cookingText =
    natureLevel === null
      ? ''
      : natureLevel <= -1
        ? t.advice.cookingCool
        : natureLevel >= 1
          ? t.advice.cookingWarm
          : t.advice.cookingBalanced;

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.pentagonArea}>
        <FlavorPentagon
          totals={totals}
          natureLevel={natureLevel}
          seasonFlavors={seasonInfo.recommendation.flavors}
          axisLabels={fiveFlavorAxisLabels(lang)}
          size={220}
        />
        <Text style={[styles.foodNames, { color: c.textSecondary }]}>
          {joinFoodNames(foods, lang)}
        </Text>
      </View>

      <Section title={t.advice.flavorsTitle} color={c}>
        {flavorFact}
      </Section>

      <Section title={t.advice.categoriesTitle} color={c}>
        {categoryFact}
      </Section>

      <Section title={t.advice.seasonTitle} color={c}>
        {t.advice.seasonFact(
          fiveSeasonName(seasonInfo, lang),
          seasonInfo.recommendation.flavors,
        )}
      </Section>

      {opposite && (
        <Section title={t.advice.balanceTitle} color={c}>
          {t.advice.oppositeFact(
            foodName(opposite.a, lang),
            foodName(opposite.b, lang),
          )}
        </Section>
      )}

      {suggestions && (suggestions.flavors.length > 0 || suggestions.cats.length > 0) && (
        <View style={[styles.section, { backgroundColor: c.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
            {t.advice.fillTitle}
          </Text>
          {suggestions.flavors.map((s) => (
            <SuggestRow
              key={`fl-${s.flavor}`}
              label={t.advice.fillFlavorLabel(s.flavor)}
              foods={s.foods}
              color={c}
            />
          ))}
          {suggestions.cats.map((s) => (
            <SuggestRow
              key={`cat-${s.cat}`}
              label={t.advice.fillCatLabel(s.cat)}
              foods={s.foods}
              color={c}
            />
          ))}
          <Text style={[styles.suggestNote, { color: c.textSecondary }]}>
            {t.advice.fillNote}
          </Text>
        </View>
      )}

      {natureLevel !== null && (
        <Section title={t.advice.cookingTitle} color={c}>
          {cookingText}
        </Section>
      )}

      <Pressable
        style={[styles.saveButton, saved && styles.saveDone]}
        onPress={save}
        disabled={saved}
      >
        <Text style={styles.saveText}>{saved ? t.advice.savedDone : t.advice.save}</Text>
      </Pressable>

      {saved && (
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: c.textSecondary }]}>
            {t.advice.close}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function Section({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: { text: string; textSecondary: string; backgroundElement: string };
}) {
  return (
    <View style={[styles.section, { backgroundColor: color.backgroundElement }]}>
      <Text style={[styles.sectionTitle, { color: color.textSecondary }]}>{title}</Text>
      <Text style={[styles.sectionBody, { color: color.text }]}>{children}</Text>
    </View>
  );
}

function SuggestRow({
  label,
  foods,
  color,
}: {
  label: string;
  foods: Food[];
  color: { text: string; textSecondary: string; backgroundSelected: string };
}) {
  const { lang } = useLang();
  return (
    <View style={styles.suggestRow}>
      <Text style={[styles.suggestLabel, { color: color.textSecondary }]}>{label}</Text>
      <View style={styles.suggestChips}>
        {foods.map((f) => (
          <Pressable
            key={f.id}
            style={[styles.suggestChip, { backgroundColor: color.backgroundSelected }]}
            onPress={() => router.push(`/food/${f.id}`)}
          >
            <Text style={{ color: color.text, fontSize: 13 }}>{foodName(f, lang)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  pentagonArea: { alignItems: 'center', gap: 8 },
  foodNames: { fontSize: 13, textAlign: 'center' },
  section: { borderRadius: 12, padding: 16, gap: 6 },
  sectionTitle: { fontSize: 12 },
  sectionBody: { fontSize: 15, lineHeight: 22 },
  suggestRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4 },
  suggestLabel: { fontSize: 13, width: 72, lineHeight: 28 },
  suggestChips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  suggestChip: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  suggestNote: { fontSize: 11, lineHeight: 16, marginTop: 8 },
  saveButton: {
    backgroundColor: '#8FAF8B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveDone: { opacity: 0.6 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backLink: { textAlign: 'center', padding: 8, fontSize: 14 },
});
