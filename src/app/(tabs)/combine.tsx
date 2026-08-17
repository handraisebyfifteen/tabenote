/**
 * 組み合わせ — 食材を選ぶ画面(指示書 6-2)。
 *
 * この画面では術語(性味などの専門用語)を見せない。
 * 性は色の点だけで表現する(温=暖色、寒=寒色)。
 *
 * 探し方は3層(指示書 6-2):
 *   ★よく使う(お気に入りの手動登録 + 選択履歴からの自動昇格)/ 15分類タブ / 検索。
 * 食材画像は権利がクリーンな素材が用意でき次第追加する(指示書 8-5)。
 */
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';

import FlavorPentagon, { natureColor } from '@/components/FlavorPentagon';
import { Colors } from '@/constants/theme';
import {
  ALL_CAT15,
  SELECTABLE_FOODS,
  getFood,
  searchFoods,
  type Cat15,
  type Food,
} from '@/data/foods';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import { cat15Label, fiveFlavorAxisLabels, foodName } from '@/i18n/terms';
import { aggregateFlavors } from '@/logic/flavors';
import { averageNatureLevel, natureValue } from '@/logic/nature';
import { getFiveSeason } from '@/logic/season';
import { loadUserData, recordSelections, toggleFavorite } from '@/lib/storage';

/** よく使う層に自動で上がる件数の上限(お気に入りを除く) */
const AUTO_QUICK_LIMIT = 20;

/** 「★よく使う」を表すタブ値(15分類と排他) */
type CatTab = Cat15 | 'quick' | null;

export default function CombineScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<CatTab>(null);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<Record<string, number>>({});
  // 初回だけ「★よく使う」を既定タブにする(空のときは「すべて」のまま)
  const quickInitialized = useRef(false);

  // 手帳からの呼び出し(指示書 6-3「呼び出して再編集」)。同じ組み合わせを二度適用しない
  const { ids: presetIds } = useLocalSearchParams<{ ids?: string }>();
  const appliedPreset = useRef<string | null>(null);
  useEffect(() => {
    if (typeof presetIds !== 'string' || presetIds === '') return;
    if (appliedPreset.current === presetIds) return;
    appliedPreset.current = presetIds;
    const valid = presetIds
      .split(',')
      .filter((id) => {
        const f = getFood(id);
        return f !== undefined && f.nature !== '';
      });
    setSelectedIds(valid);
  }, [presetIds]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadUserData().then((d) => {
        if (!active) return;
        setFavorites(d.favorites);
        setHistory(d.selectionHistory);
        if (!quickInitialized.current) {
          quickInitialized.current = true;
          if (d.favorites.length > 0 || Object.keys(d.selectionHistory).length > 0) {
            setCat('quick');
          }
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  /** お気に入り(登録順)+ 選択回数の多い順(自動昇格) */
  const quickFoods = useMemo(() => {
    const favSet = new Set(favorites);
    const favs = favorites
      .map((id) => getFood(id))
      .filter((f): f is Food => f !== undefined && f.nature !== '');
    const often = SELECTABLE_FOODS.filter(
      (f) => !favSet.has(f.id) && (history[f.id] ?? 0) > 0,
    )
      .sort((a, b) => (history[b.id] ?? 0) - (history[a.id] ?? 0))
      .slice(0, AUTO_QUICK_LIMIT);
    return [...favs, ...often];
  }, [favorites, history]);

  const seasonInfo = useMemo(() => getFiveSeason(new Date()), []);

  const selectedFoods = useMemo(
    () =>
      selectedIds
        .map((id) => SELECTABLE_FOODS.find((f) => f.id === id))
        .filter((f): f is Food => f !== undefined),
    [selectedIds],
  );

  const totals = useMemo(() => aggregateFlavors(selectedFoods), [selectedFoods]);
  const natureLevel = useMemo(() => averageNatureLevel(selectedFoods), [selectedFoods]);

  const listFoods = useMemo(() => {
    if (query.trim() !== '') {
      // 別名(note)・英語名にもヒットさせる。参照のみ項目はこの画面では選べないので除く
      return searchFoods(query).filter((f) => f.nature !== '');
    }
    if (cat === 'quick') {
      return quickFoods;
    }
    if (cat !== null) {
      return SELECTABLE_FOODS.filter((f) => f.cat15 === cat);
    }
    return SELECTABLE_FOODS;
  }, [query, cat, quickFoods]);

  const toggle = (id: string) => {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  };

  const toggleStar = async (id: string) => {
    const d = await toggleFavorite(id);
    setFavorites(d.favorites);
  };

  const decide = async () => {
    if (selectedIds.length === 0) return;
    await recordSelections(selectedIds);
    router.push({ pathname: '/advice', params: { ids: selectedIds.join(',') } });
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <View style={styles.pentagonArea}>
        <FlavorPentagon
          totals={totals}
          natureLevel={natureLevel}
          seasonFlavors={seasonInfo.recommendation.flavors}
          axisLabels={fiveFlavorAxisLabels(lang)}
          size={180}
        />
      </View>

      {selectedFoods.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsRow}
          contentContainerStyle={styles.chipsContent}
        >
          {selectedFoods.map((f) => (
            <Pressable
              key={f.id}
              style={[styles.chip, { backgroundColor: c.backgroundSelected }]}
              onPress={() => toggle(f.id)}
            >
              <Text style={{ color: c.text }}>{foodName(f, lang)} ✕</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <TextInput
        style={[
          styles.search,
          { backgroundColor: c.backgroundElement, color: c.text },
        ]}
        placeholder={t.combine.searchPlaceholder}
        placeholderTextColor={c.textSecondary}
        value={query}
        onChangeText={setQuery}
      />

      {query.trim() === '' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsRow}
          contentContainerStyle={styles.chipsContent}
        >
          <Pressable
            style={[
              styles.chip,
              { backgroundColor: cat === 'quick' ? '#8FAF8B' : c.backgroundElement },
            ]}
            onPress={() => setCat(cat === 'quick' ? null : 'quick')}
          >
            <Text style={{ color: cat === 'quick' ? '#fff' : c.text }}>
              {t.combine.quickTab}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.chip,
              { backgroundColor: cat === null ? '#8FAF8B' : c.backgroundElement },
            ]}
            onPress={() => setCat(null)}
          >
            <Text style={{ color: cat === null ? '#fff' : c.text }}>
              {t.combine.allTab}
            </Text>
          </Pressable>
          {ALL_CAT15.map((k) => (
            <Pressable
              key={k}
              style={[
                styles.chip,
                { backgroundColor: cat === k ? '#8FAF8B' : c.backgroundElement },
              ]}
              onPress={() => setCat(cat === k ? null : k)}
            >
              <Text style={{ color: cat === k ? '#fff' : c.text }}>
                {cat15Label(k, lang)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <FlatList
        style={styles.list}
        data={listFoods}
        keyExtractor={(f) => f.id}
        ListEmptyComponent={
          cat === 'quick' && query.trim() === '' ? (
            <Text style={[styles.quickEmpty, { color: c.textSecondary }]}>
              {t.combine.quickEmpty}
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const selected = selectedIds.includes(item.id);
          const starred = favorites.includes(item.id);
          return (
            <Pressable
              style={[
                styles.row,
                { backgroundColor: selected ? c.backgroundSelected : 'transparent' },
              ]}
              onPress={() => toggle(item.id)}
            >
              <View
                style={[styles.dot, { backgroundColor: natureColor(natureValue(item)) }]}
              />
              <Text style={[styles.rowName, { color: c.text }]}>
                {foodName(item, lang)}
              </Text>
              {selected && <Text style={{ color: '#8FAF8B' }}>✓</Text>}
              <Pressable
                onPress={() => toggleStar(item.id)}
                hitSlop={10}
                style={styles.starButton}
              >
                <Text style={{ color: starred ? '#D9A441' : c.textSecondary, fontSize: 16 }}>
                  {starred ? '★' : '☆'}
                </Text>
              </Pressable>
            </Pressable>
          );
        }}
      />

      <Pressable
        style={[styles.decideButton, selectedIds.length === 0 && styles.decideDisabled]}
        onPress={decide}
        disabled={selectedIds.length === 0}
      >
        <Text style={styles.decideText}>{t.combine.decide(selectedIds.length)}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  pentagonArea: { alignItems: 'center', paddingTop: 8 },
  chipsRow: { flexGrow: 0 },
  chipsContent: { paddingHorizontal: 12, gap: 8, paddingVertical: 4 },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  search: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  list: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowName: { fontSize: 15, flex: 1 },
  starButton: { paddingLeft: 8 },
  quickEmpty: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  decideButton: {
    backgroundColor: '#8FAF8B',
    margin: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  decideDisabled: { opacity: 0.4 },
  decideText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
