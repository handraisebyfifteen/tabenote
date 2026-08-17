/**
 * 食材の詳細(図鑑の個票、指示書 6-3)。
 *
 * アプリが表示するのは性・味・帰経・分類・備考(出典あり、編集不可)まで。
 * 効能は表示しない。書くのは持ち主(メモ欄)。この線引きが手帳の核(指示書 2-3)。
 */
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import FlavorPentagon, { natureColor } from '@/components/FlavorPentagon';
import FoodThumb from '@/components/FoodThumb';
import PageHead from '@/components/PageHead';
import { Text, TextInput } from '@/components/Type';
import { Colors } from '@/constants/theme';
import { getFoodEmoji } from '@/data/foodEmoji';
import { FOODS, getFood, isReferenceOnly } from '@/data/foods';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import {
  cat15Label,
  cat5Label,
  fiveFlavorAxisLabels,
  flavorsLabel,
  foodName,
  meridiansLabel,
  natureLabel,
} from '@/i18n/terms';
import { aggregateFlavors } from '@/logic/flavors';
import { natureValue } from '@/logic/nature';
import { loadUserData, setFoodNote, toggleFavorite } from '@/lib/storage';

/**
 * web の静的書き出しで全食材ぶんのHTMLを作る(書き出し時に Node.js で1度だけ動く)。
 * これが無いと /food/[id].html だけが出力され、tabenote.app/food/xxx の直リンクが 404 になる。
 */
export async function generateStaticParams(): Promise<Record<string, string>[]> {
  return FOODS.map((food) => ({ id: food.id }));
}

export default function FoodDetailScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  const { id } = useLocalSearchParams<{ id: string }>();
  const food = getFood(id ?? '');

  const [starred, setStarred] = useState(false);
  const [memo, setMemoUi] = useState('');
  // blur を経ずに画面を離れてもメモが消えないよう、最新値と保存済み値を ref に持つ
  const memoState = useRef({ loaded: false, text: '', persisted: '' });

  const setMemo = (text: string) => {
    memoState.current.text = text;
    setMemoUi(text);
  };

  useFocusEffect(
    useCallback(() => {
      if (!food) return;
      let active = true;
      loadUserData().then((d) => {
        if (!active) return;
        const saved = d.notes[food.id] ?? '';
        setStarred(d.favorites.includes(food.id));
        memoState.current = { loaded: true, text: saved, persisted: saved };
        setMemoUi(saved);
      });
      return () => {
        active = false;
        const s = memoState.current;
        if (s.loaded && s.text !== s.persisted) {
          s.persisted = s.text;
          setFoodNote(food.id, s.text);
        }
      };
    }, [food?.id]),
  );

  if (!food) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: c.background }]}>
        <Text style={{ color: c.textSecondary }}>{t.food.notFound}</Text>
      </View>
    );
  }

  const refOnly = isReferenceOnly(food);
  const totals = aggregateFlavors([food]);
  const natureLevel = refOnly ? null : natureValue(food);

  const star = async () => {
    const d = await toggleFavorite(food.id);
    setStarred(d.favorites.includes(food.id));
  };

  const persistMemo = () => {
    const s = memoState.current;
    if (s.loaded && s.text !== s.persisted) {
      s.persisted = s.text;
      setFoodNote(food.id, s.text);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: foodName(food, lang) }} />
      <PageHead
        {...t.meta.food(foodName(food, lang), {
          nature: food.nature !== '' ? natureLabel(food.nature, lang) : '',
          flavors: food.flavors.length > 0 ? flavorsLabel(food.flavors, lang) : '',
          meridians: food.meridians !== '' ? meridiansLabel(food.meridians, lang) : '',
          category: cat15Label(food.cat15, lang),
        })}
        path={`/food/${food.id}`}
      />

      <View style={styles.header}>
        <FoodThumb
          name={foodName(food, lang)}
          emoji={getFoodEmoji(food.name)}
          color={natureColor(refOnly ? null : natureValue(food))}
          size={48}
        />
        <View style={styles.headerName}>
          <Text style={[styles.name, { color: c.text }]}>{foodName(food, lang)}</Text>
          {lang === 'en' && (
            <Text style={[styles.nameJa, { color: c.textSecondary }]}>{food.name}</Text>
          )}
        </View>
        {!refOnly && (
          <Pressable onPress={star} hitSlop={10}>
            <Text style={{ color: starred ? '#D9A441' : c.textSecondary, fontSize: 24 }}>
              {starred ? '★' : '☆'}
            </Text>
          </Pressable>
        )}
      </View>

      {refOnly ? (
        <View style={[styles.card, { backgroundColor: c.backgroundElement }]}>
          <Text style={[styles.refOnlyText, { color: c.text }]}>
            {t.food.referenceOnly(food.note)}
          </Text>
        </View>
      ) : (
        <View style={styles.pentagonArea}>
          <FlavorPentagon
            totals={totals}
            natureLevel={natureLevel}
            axisLabels={fiveFlavorAxisLabels(lang)}
            size={200}
          />
        </View>
      )}

      <View style={[styles.card, { backgroundColor: c.backgroundElement }]}>
        {food.nature !== '' && (
          <AttrRow
            label={t.food.natureLabel}
            value={natureLabel(food.nature, lang)}
            color={c}
          />
        )}
        <AttrRow
          label={t.food.flavorLabel}
          value={food.flavors.length > 0 ? flavorsLabel(food.flavors, lang) : t.food.emptyValue}
          color={c}
        />
        <AttrRow
          label={t.food.meridiansLabel}
          value={food.meridians !== '' ? meridiansLabel(food.meridians, lang) : t.food.emptyValue}
          color={c}
        />
        <AttrRow
          label={t.food.categoryLabel}
          value={
            cat15Label(food.cat15, lang) === cat5Label(food.cat5, lang)
              ? cat15Label(food.cat15, lang)
              : `${cat15Label(food.cat15, lang)}(${cat5Label(food.cat5, lang)})`
          }
          color={c}
        />
        {!refOnly && food.note !== '' && (
          <AttrRow label={t.food.noteLabel} value={food.note} color={c} />
        )}
      </View>

      <View style={[styles.card, { backgroundColor: c.backgroundElement }]}>
        <Text style={[styles.memoTitle, { color: c.textSecondary }]}>
          {t.food.memoTitle}
        </Text>
        <TextInput
          style={[styles.memoInput, { color: c.text }]}
          multiline
          value={memo}
          onChangeText={setMemo}
          onBlur={persistMemo}
          placeholder={t.food.memoPlaceholder}
          placeholderTextColor={c.textSecondary}
        />
        <Text style={[styles.memoHint, { color: c.textSecondary }]}>
          {t.food.memoHint}
        </Text>
      </View>
    </ScrollView>
  );
}

function AttrRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: { text: string; textSecondary: string };
}) {
  return (
    <View style={styles.attrRow}>
      <Text style={[styles.attrLabel, { color: color.textSecondary }]}>{label}</Text>
      <Text style={[styles.attrValue, { color: color.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16, gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerName: { flex: 1, gap: 2 },
  name: { fontSize: 26, fontWeight: '700' },
  nameJa: { fontSize: 13 },
  pentagonArea: { alignItems: 'center' },
  card: { borderRadius: 12, padding: 16, gap: 8 },
  refOnlyText: { fontSize: 14, lineHeight: 20 },
  attrRow: { flexDirection: 'row', gap: 12 },
  attrLabel: { fontSize: 14, width: 76, lineHeight: 21 },
  attrValue: { fontSize: 14, flex: 1, lineHeight: 21 },
  memoTitle: { fontSize: 12 },
  memoInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 96,
    textAlignVertical: 'top',
    padding: 0,
  },
  memoHint: { fontSize: 11 },
});
